# VPS Setup Runbook — claudesl.tchejunior.dev

One-time setup for the Hetzner VPS that serves the static build.
Run steps in order. Each step ends with a verification command.

---

## Step 1 — Generate deploy SSH key (local machine)

```bash
ssh-keygen -t ed25519 -C "github-actions-claudesl" -f ~/.ssh/claudesl_deploy -N ""
```

---

## Step 2 — Create `deploy` user on the VPS

```bash
ssh jarvis@j4rvis.com.br
sudo useradd -m -s /bin/bash deploy
sudo mkdir -p /home/deploy/.ssh
sudo chmod 700 /home/deploy/.ssh
sudo tee /home/deploy/.ssh/authorized_keys > /dev/null <<'EOF'
<paste contents of ~/.ssh/claudesl_deploy.pub>
EOF
sudo chmod 600 /home/deploy/.ssh/authorized_keys
sudo chown -R deploy:deploy /home/deploy/.ssh
```

Verify: `ssh -i ~/.ssh/claudesl_deploy deploy@j4rvis.com.br 'whoami'` → `deploy`.

---

## Step 3 — Web root

```bash
sudo mkdir -p /var/www/claudesl/releases
sudo chown -R deploy:deploy /var/www/claudesl
sudo -u deploy bash -c '
  mkdir -p /var/www/claudesl/releases/_placeholder &&
  echo "<h1>claudesl: pending first deploy</h1>" > /var/www/claudesl/releases/_placeholder/index.html
'
sudo -u deploy ln -sfn /var/www/claudesl/releases/_placeholder /var/www/claudesl/current
```

---

## Step 4 — Sudoers entry for nginx reload

```bash
sudo tee /etc/sudoers.d/deploy > /dev/null <<'EOF'
deploy ALL=(root) NOPASSWD: /usr/sbin/nginx -t
deploy ALL=(root) NOPASSWD: /bin/systemctl reload nginx
EOF
sudo chmod 440 /etc/sudoers.d/deploy
sudo visudo -cf /etc/sudoers.d/deploy
```

---

## Step 5 — nginx site (HTTP-only first)

```bash
sudo tee /etc/nginx/sites-available/claudesl > /dev/null <<'EOF'
server {
    listen 80;
    server_name claudesl.tchejunior.dev;
    root /var/www/claudesl/current;
    index index.html;
    location / { try_files $uri $uri/ /index.html; }
}
EOF
sudo ln -sf /etc/nginx/sites-available/claudesl /etc/nginx/sites-enabled/claudesl
sudo nginx -t && sudo systemctl reload nginx
curl -I http://claudesl.tchejunior.dev/   # expect 200
```

---

## Step 6 — TLS via certbot, then final nginx config

```bash
sudo certbot --nginx -d claudesl.tchejunior.dev \
  --non-interactive --agree-tos -m marcelobrigato@gmail.com --redirect

sudo tee /etc/nginx/sites-available/claudesl > /dev/null <<'EOF'
server {
    listen 80;
    server_name claudesl.tchejunior.dev;
    return 301 https://$host$request_uri;
}
server {
    listen 443 ssl;
    server_name claudesl.tchejunior.dev;

    ssl_certificate /etc/letsencrypt/live/claudesl.tchejunior.dev/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/claudesl.tchejunior.dev/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    server_tokens off;
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains" always;
    add_header X-Content-Type-Options nosniff always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    root /var/www/claudesl/current;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;
    gzip_min_length 1024;

    location /assets/ {
        add_header Cache-Control "public, max-age=31536000, immutable";
        try_files $uri =404;
    }
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
    location / { try_files $uri $uri/ /index.html; }

    access_log /var/log/nginx/claudesl_access.log;
    error_log  /var/log/nginx/claudesl_error.log warn;
}
EOF
sudo nginx -t && sudo systemctl reload nginx
curl -I https://claudesl.tchejunior.dev/   # expect 200
```

---

## Step 7 — GitHub Actions secrets

At https://github.com/tchejunior/claude-sl/settings/secrets/actions, add:

| Name | Value |
|---|---|
| `VPS_HOST` | `j4rvis.com.br` |
| `VPS_USER` | `deploy` |
| `VPS_SSH_KEY` | full contents of `~/.ssh/claudesl_deploy` (private key) |
| `VPS_KNOWN_HOSTS` | output of `ssh-keyscan -t ed25519,rsa j4rvis.com.br` |

---

## Step 8 — Collaborator + branch protection

- Settings → Collaborators → invite `rogeriosantos` with **Write**.
- Settings → Branches → protect `main`:
  - Require PR + 1 approval, dismiss stale approvals
  - Require Code Owners review
  - Require status checks: `ci / build`, `ci / py`, `deploy`
  - Require linear history
  - Disallow bypass

---

## Step 9 — Trigger first deploy

Push any commit to `main`. Verify:

Change to test push to main

```bash
curl -s https://claudesl.tchejunior.dev/ | head -5
```

---

## Step 10 — Sanity checks

```bash
ssh jarvis@j4rvis.com.br '
  ls -la /var/www/claudesl/current
  ls /var/www/claudesl/releases/ | tail -5
  sudo certbot certificates 2>&1 | grep -A2 claudesl
  sudo systemctl status nginx --no-pager | head -5
'
```

import pathlib
import check_upstream_schema as mod

FIXTURE = pathlib.Path(__file__).parent / 'fixture_statusline.html'


def test_parses_field_table():
    html = FIXTURE.read_text(encoding='utf-8')
    fields = mod.parse_field_table(html)
    paths = {f['path'] for f in fields}
    assert 'model.id' in paths
    assert 'rate_limits.five_hour.used_percentage' in paths
    assert 'effort.level' in paths


def test_parses_schema_block():
    html = FIXTURE.read_text(encoding='utf-8')
    schema = mod.parse_schema_block(html)
    assert isinstance(schema, dict)
    assert 'rate_limits' in schema
    assert 'five_hour' in schema['rate_limits']


def test_parses_enums():
    html = FIXTURE.read_text(encoding='utf-8')
    from check_upstream_schema import _parse_field_table_with_raw, parse_enums
    fields_raw = _parse_field_table_with_raw(html)
    enums = parse_enums(fields_raw)
    assert sorted(enums.get('effort.level', [])) == sorted(['low', 'medium', 'high', 'xhigh', 'max'])

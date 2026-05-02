import check_upstream_schema as mod

OLD = {
    'fields': [
        {'path': 'model.id', 'description': 'Current model id'},
        {'path': 'cost.total_cost_usd', 'description': 'Estimated cost'},
    ],
    'enums': {'effort.level': ['low', 'medium', 'high']},
}
NEW = {
    'fields': [
        {'path': 'model.id', 'description': 'Current model id'},
        {'path': 'cost.total_cost_usd', 'description': 'Estimated cost in USD'},
        {'path': 'new.field', 'description': 'A new one'},
    ],
    'enums': {'effort.level': ['low', 'medium', 'high', 'xhigh', 'max']},
}


def test_diff_detects_added_changed_enum():
    d = mod.diff(OLD, NEW)
    assert any(f['path'] == 'new.field' for f in d['added_fields'])
    assert any(c['path'] == 'cost.total_cost_usd' for c in d['changed_fields'])
    assert d['enum_changes']['effort.level']['added'] == ['max', 'xhigh']


def test_diff_no_drift():
    d = mod.diff(OLD, OLD)
    assert mod.is_empty(d)


def test_diff_removed_field():
    d = mod.diff(NEW, OLD)
    assert any(f['path'] == 'new.field' for f in d['removed_fields'])

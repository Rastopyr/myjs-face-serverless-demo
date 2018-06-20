import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | scale-greyscale', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:scale-greyscale');
    assert.ok(route);
  });
});

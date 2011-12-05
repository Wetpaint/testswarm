wp.tests.push({
	page:'/',
	run: function(){
		module('sample');
		test('basic pass', function(){
			ok(1, 'good');
			var h = 'h';
			equal(h, 'h','h is h, so we are good');
		});
		test('expect 2', function(){
			expect(2);
			equal(1, 0, 'failing test');
			equal(1, 1, 'passing test');
		});
	}
});


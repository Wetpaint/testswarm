/* drive tests for wetpaint.com
 * An iframe in that domain loads this script
 * which instruments the iframe and runs QUnit tests for the site.
 * */
options = options || {};
window.wp = {
	modules: {},
	domain:location.protocol.concat('//',location.host), // same domain as test iframe
	swarm:'http://testswarm.wetpaint.me',
	testpath: options.testpath || '',
	tests: [],
	currentTest: false,
	mk: function(tag, attr){
		var l = document.createElement(tag);
		for(var p in attr){
			l.setAttribute(p, attr[p]);
		};
		return l;
	},
	iframeload: function(){
		var $, currentTest = wp.currentTest;
		window.page = wp.page = window.frames[0];
		$ = window.$ = window.jQuery = page.jQuery;

		// wait for each ajax call, do we want this?
		//$.ajaxSetup({async:false});
		// turn off animations
		//$.fx.off = true;
		try{
			currentTest.run();
		}catch(err){
			console.log('error running QUnit currentTest',err);
		};
		wp.next();
	},
	next: function(){
		if(document.readyState != 'complete') return;
		var url;
		this.currentTest = this.tests.shift();
		if(!this.currentTest){
			return console.log('finished'); // finished
		};
		url = this.currentTest.page;
		if(url.indexOf('http') != 0) url =  wp.domain.concat(url);
		document.getElementById('testiframe').src = url;
	}
};
(function(){ // setup basics
	var mk, swarm = wp.swarm;
	mk = wp.mk;
	var p = document.getElementsByTagName('script')[0].parentNode;
	p.appendChild(mk('link', {rel: 'stylesheet', href: wp.swarm.concat('/qunit/qunit/qunit.css'), type: 'text/css' }));
	p.appendChild(mk('script', {src: swarm.concat('/js/jquery.js')}));
	p.appendChild(mk('script', {src: swarm.concat('/qunit/qunit/qunit.js')}));
	p.appendChild(mk('script', {src: swarm.concat('/js/inject.js')}));
	if(wp.testpath){
		var item, i=0, list = wp.testpath.split(',');
		while(item = list[i++]){
			item = (item.indexOf('http') == 0) ? item : swarm.concat( item );
			p.appendChild(mk('script', {src: item}));
		};
	};
})();
window.onload = function(){
	var $;
	if(window.jQuery) $ = window.jq = window.jQuery.noConflict(true);
	window.$ = window.jQuery = false;
	var tags = [
		{h1: ["qunit-header", "QUnit"]},
		{h2: ["qunit-banner", ""]},
		{div: ["qunit-testrunner-toolbar", ""]},
		{h2: ["qunit-userAgent", ""]},
		{ol: ["qunit-tests", ""]},
		{div: ["qunit-fixture", "test markup, will be hidden"]}
	];
	var tag, id, txt, p, f = document.createDocumentFragment();
	while(tag = tags.shift()){
		for(p in tag){
			txt = tag[p];
			id = txt.shift();
			txt = txt.shift();
			tag = p;
		};
		if(document.getElementById(id)) continue;
		tag = wp.mk(tag, {'id':id});
		tag.appendChild(document.createTextNode(txt));
		f.appendChild(tag);
	};
	tag = wp.mk('iframe',{id:'testiframe',height:700,width:'100%'});
	f.appendChild(tag);
	document.body.appendChild(f);
	$(tag).load(wp.iframeload);
	wp.next();
};


/* wp.swarm + wp.testpath is loaded, it pushes the tests into wp.tests
// ie wp.tests.push(<the-tests>);
// each test has:
//	page: '/path/to/page'
//	run: function with the actual tests
// eg 
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
*/

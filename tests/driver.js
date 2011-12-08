/* drive tests for wetpaint.com
 * An iframe in that domain loads this script
 * which instruments the iframe and runs QUnit tests for the site.
 * */
options = options || {};
if(!window.console) console = {log:function(){}};
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
		if(!wp.currentTest) return;

		// wait for each ajax call, do we want this?
		//$.ajaxSetup({async:false});
		// turn off animations
		//$.fx.off = true;
		setTimeout(function(){
		window.page = wp.page = window.frames[0];
		$ = window.$ = window.jQuery = page.jQuery;
		try{
			if(currentTest.before) currentTest.before();
		}catch(err){
			console.log('error in before()',err,currentTest);
		};
		try{
			currentTest.run();
		}catch(err){
			console.log('error in run()',err,currentTest);
		};
		try{
			if(currentTest.after) currentTest.after();
		}catch(err){
			console.log('error in after()',err,currentTest);
		};
		setTimeout(wp.next,100);
		},0);
	},
	next: function(){
		if(document.readyState != 'complete') return;
		var url;
		wp.currentTest = wp.tests.shift();
		if(!wp.currentTest){
			return console.log('finished'); // finished
		};
		url = wp.currentTest.page;
		if(url.indexOf('http') != 0) url =  wp.domain.concat(url);
		document.getElementById('testiframe').src = url;
	}
};
(function(){ // setup basics
	var mk, swarm = wp.swarm;
	mk = wp.mk;
	var p = document.getElementsByTagName('script')[0].parentNode, time = (new Date).getTime();
	p.appendChild(mk('link', {rel: 'stylesheet', href: wp.swarm.concat('/qunit/qunit/qunit.css'), type: 'text/css' }));
	p.appendChild(mk('script', {src: swarm.concat('/js/jquery.js')}));
	p.appendChild(mk('script', {src: swarm.concat('/qunit/qunit/qunit.js')}));
	p.appendChild(mk('script', {src: swarm.concat('/js/inject.js')}));
	if(wp.testpath){
		var item, i=0, list = wp.testpath.split(',');
		while(item = list[i++]){
			item = (item.indexOf('http') == 0) ? item : swarm.concat( item );
			p.appendChild(mk('script', {src: item.concat('?',time)}));
		};
	};
})();
window.onload = function(){
	var jq;
	if(window.jQuery) jq = window.jq = window.jQuery.noConflict(true);
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
	jq(tag).load(wp.iframeload);
	f.appendChild(tag);
	//window.jq(tag).load(wp.iframeload);
	document.body.appendChild(f);
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

/* drive tests for wetpaint.com
 * An iframe in that domain loads this script
 * which instruments the iframe and runs QUnit tests for the site.
 * */
options = options || {};
if(!window.console) console = {log:function(){}, info: function(){}, debug: function(){}};
try{
	sessionStorage.clear();
}catch(err){};

window.et = {
	expect: 0,
	completed: 0,
	module: function(name, callbacks){
		var o = callbacks || {}, setup = o.setup || function(){},
			teardown = o.teardown || function(){};
		QUnit.module(name, {setup: function(){
				et.expect++;
				setup();
			}, teardown: function(){
				teardown();
				et.completed++;
				if(et.expect==et.completed){
					var currentTest = et.currentTest;
//					try{
						if(currentTest && currentTest.after) currentTest.after();
//					}catch(err){
//						console.log('error in after()',err,currentTest);
//					};
					et.next();
				};
			}
		});
	},
	modules: { },
	domain:location.protocol.concat('//',location.host), // same domain as test iframe
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
	try{
		(options.ready || function(){})();
	}catch(err){ console.log(err); };

		var $, currentTest = et.currentTest;
		if(!et.currentTest) return;

		// wait for each ajax call, do we want this?
		//$.ajaxSetup({async:false});
		// turn off animations
		//$.fx.off = true;
		window.page = et.page = window.frames[0];
		$ = window.$ = window.jQuery = page.jQuery;
		window.wp = page.wp;
//		try{
			if(currentTest.before) currentTest.before();
//		}catch(err){
//			console.log('error in before()',err,currentTest);
//		};

		try{
			currentTest.run();
		}catch(err){
			console.log('error in run()',err,currentTest);
		};
	},
	next: function(){
		if(document.readyState != 'complete') return;
		var url;
		et.currentTest = et.tests.shift();
		if(!et.currentTest){
			return console.log('finished'); // finished
		};
		url = et.currentTest.page;
		if(url.indexOf('http') != 0) url =  et.domain.concat(url);
		document.getElementById('testiframe').src = url;
	}
};
(function(){ // setup basics
// create required page elements
	options.swarm = options.swarm || 'http://testswarm.wetpaint.me';
	var mk = et.mk, swarm = options.swarm, testpath = options.testpath || '',
		p = document.getElementsByTagName('script')[0].parentNode, time = (new Date).getTime();
	p.appendChild(mk('link', {rel: 'stylesheet', href: swarm.concat('/qunit/qunit/qunit.css'), type: 'text/css' }));
	p.appendChild(mk('script', {src: swarm.concat('/js/jquery.js')}));
	p.appendChild(mk('script', {src: swarm.concat('/qunit/qunit/qunit.js')}));
	p.appendChild(mk('script', {src: swarm.concat('/pavlov/pavlov.js')}));
	p.appendChild(mk('script', {src: swarm.concat('/js/inject.js')}));

	var item, i=0, list = testpath.split(',');
	while(item = list[i++]){
		item = (item.indexOf('http') == 0) ? item : swarm.concat( item );
		p.appendChild(mk('script', {src: item.concat('?',time)}));
	};
	var tags = [
		{h1: ["qunit-header", "QUnit"]},
		{h2: ["qunit-banner", ""]},
		{div: ["qunit-testrunner-toolbar", ""]},
		{h2: ["qunit-userAgent", ""]},
		{ol: ["qunit-tests", ""]},
		{div: ["qunit-fixture", "test markup, will be hidden"]}
	];
	var tag, id, txt, p, f = et.mk('div',{'id':'qunit-results','style':'width:30%;height:100%;'});
	while(tag = tags.shift()){
		for(p in tag){
			txt = tag[p];
			id = txt.shift();
			txt = txt.shift();
			tag = p;
		};
		if(document.getElementById(id)) continue;
		tag = et.mk(tag, {'id':id});
		tag.appendChild(document.createTextNode(txt));
		f.appendChild(tag);
	};
	document.body.setAttribute('style','margin:0;padding:0;');
	tag = et.mk('iframe',{id:'testiframe',height:700,width:'70%',height:'100%','style':'border:0;position:absolute;left:30%;top:0;'});
	f.appendChild(tag);
	document.body.appendChild(f);
// wait for QUnit and jQuery to load before starting to load iframe
	window.initDriver = function(){
		if(window.jQuery && window.QUnit && QUnit.load){
			clearTimeout(window.initDriver.timer);
			QUnit.config.autostart = false;
			window.jq = window.jQuery.noConflict(true);
			window.$ = window.jQuery = false;
			jq('iframe').load(et.iframeload);
			if(!document.getElementById('qunit-results').getElementsByTagName('label').length) QUnit.load();
			et.next();
		}else{
			window.initDriver.timer = setTimeout(window.initDriver,500);
		};
	};
	initDriver();
})();

/* et.swarm + et.testpath is loaded, it pushes the tests into et.tests
// ie et.tests.push(<the-tests>);
// each test has:
//	page: '/path/to/page'
//	run: function with the actual tests
// eg 
et.tests.push({
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

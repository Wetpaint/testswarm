/* 
 * use webpagetest.org for performance testing of web pages
 * for usage just do:
 * % node this-file
 *
 * requires: node, libxmljs
 *
 * node (includes npm)
 * nodejs.org
 *
 * npm install libxmljs
 * https://github.com/polotek/libxmljs
 *
 * created late April 2012 
 *
 * link in with HUDSON using NodeJS plugin
 * https://wiki.jenkins-ci.org/display/JENKINS/NodeJS+Plugin
 *
 * use ENV vars like:
 * console.log(process.env['WORKSPACE']);
 *
 * to have Hudson build fail just throw an error
 *
 * TODO
 * basic comparisons of performance to see trends
 *
 *
 * */

var debug = true;
var http = require('http');
var fs = require('fs');
var _hudson_workspace = process.env['WORKSPACE'];
// ssh to the process.env['WORKSPACE'] and run 'sudo npm install libxmljs'
var libxmljs = require(_hudson_workspace ? _hudson_workspace.replace(/workspace/,'node_modules/libxmljs'):'libxmljs');
//console.log('Current directory: ' + process.cwd());
var domain = "http://www.stage.wetpaint.me";
// console.log(process.argv[1].replace(/^(.*\/).*$/,'$1'));
var filename = (_hudson_workspace || process.cwd() ) + '/' + 'webpagetest-tests.json';
/* 
 * NOTE browsers and connection speed are set in the location
 * values and details are at:
 * https://sites.google.com/a/webpagetest.org/docs/advanced-features/webpagetest-restful-apis#TOC-Location-information
 * http://www.webpagetest.org/getLocations.php?f=xml
 *
 * */
var testBrowsers = {
	desktop: 'Dulles:Chrome.FIOS'.split(','),
	mobile: 'Dulles:Chrome.Dial'.split(',')
/*
	desktop: 'Dulles_IE8.DSL,Dulles_IE9.DSL,Dulles:Chrome.DSL,Dulles:Chrome.FIOS'.split(','),
	mobile: 'Dulles:Chrome.DSL,Dulles:Chrome.Dial'.split(',')
*/
};
var testPaths = [
"/",
/*
"/shows",
"/gossip",
"/glee",
"/glee/spoilers",
"/glee/gallery/spoiler-photos-for-glee-season-3-episode-17-dance-with-somebody-the-whitney-houston-tribute",
"/glee/articles/glee-spoiler-roundup-does-quinn-die-what-we-know-so-far"
*/
];
var pending = 0;
var count = 0;

/*
id for /glee  is  120423_M0_42FRH
id for /  is  120423_EE_42FRJ
*/
//var tests = {};
var tests = {};
/*{
'120423_EE_42FRJ':{id:'120423_EE_42FRJ',url:'http://www.stage.wetpaint.me/',time:new Date,result:false},
'120423_M0_42FRH':{id:'120423_M0_42FRH',url:'http://www.stage.wetpaint.me/glee',time:new Date,result:false}
};
*/
var backup = JSON.stringify(tests);
var webpagetest = 'www.webpagetest.org';
/*
 * sends an individual test over to webpagetest.org
 *
 * @param pass = {
 *	path: '/path/to/content?args',
 *	browser: 'Dulles_IE9.DSL' // see above var testBrowsers
 * }
 * */
function submit_test(pass){
	var url = domain + pass.path;
	if(debug) console.log('\ttest:',pass.browser,url);

	http.get({
		host: webpagetest,
		//host: '127.0.0.1',
		port: 80,
		// https://sites.google.com/a/webpagetest.org/docs/advanced-features/webpagetest-restful-apis
		// "/runtest.php?runs=2&f=json&k=f4fbd5e4c65340f78d44d17328da6f3d&location=Dulles_IE9.DSL&url=http://domain/path/to/content?query
		path: "/runtest.php?runs=2&f=json&k=f4fbd5e4c65340f78d44d17328da6f3d&location=" + pass.browser + "&url=" + url
	}, function(req){
		++pending;
		if(debug) console.log('\thave:',url);
		req.on('end',function(){
			--pending;
			++count;
			if(pending <= 0) save_tests();
		}).on('data',function(res){
			req.removeListener('data',arguments.callee);
		/*
		 * {"statusCode":200,"statusText":"Ok","data":{"testId":"120423_ZS_42FDB","ownerKey":"8ca1bfc11cb2b2ba4e963a8b2470726a2f0c861c","jsonUrl":"http:\/\/www.webpagetest.org\/results.php?test=120423_ZS_42FDB&f=json","xmlUrl":"http:\/\/www.webpagetest.org\/xmlResult\/120423_ZS_42FDB\/","userUrl":"http:\/\/www.webpagetest.org\/result\/120423_ZS_42FDB\/","summaryCSV":"http:\/\/www.webpagetest.org\/result\/120423_ZS_42FDB\/page_data.csv","detailCSV":"http:\/\/www.webpagetest.org\/result\/120423_ZS_42FDB\/requests.csv"}}
		 * */
			var test = JSON.parse(res.toString());
			//var test = JSON.parse('{"statusCode":200,"statusText":"Ok","data":{"testId":"120423_ZS_42FDB","ownerKey":"8ca1bfc11cb2b2ba4e963a8b2470726a2f0c861c","jsonUrl":"http:\/\/www.webpagetest.org\/results.php?test=120423_ZS_42FDB&f=json","xmlUrl":"http:\/\/www.webpagetest.org\/xmlResult\/120423_ZS_42FDB\/","userUrl":"http:\/\/www.webpagetest.org\/result\/120423_ZS_42FDB\/","summaryCSV":"http:\/\/www.webpagetest.org\/result\/120423_ZS_42FDB\/page_data.csv","detailCSV":"http:\/\/www.webpagetest.org\/result\/120423_ZS_42FDB\/requests.csv"}}');
			if(!test || !test.data || !test.data.testId || tests[test.data.testId] || test.statusCode != 200 || !test.data.xmlUrl) return;
			tests[test.data.testId] = {
				'id': test.data.testId,
				'url': url,
				'time': new Date,
				result: false
			};
			if(debug) console.log('\tid for',url,'is',test.data.testId,'\n\tcheck progress at', 'http://'+webpagetest+'/result/'+test.data.testId);
		});
	});
};

function get_completed_test_for(id){
	if(debug) console.log('get result for test:',id);
	var result = '';
	http.get({
		host: webpagetest,
		port: 80,
		// path: "/results.php?test="+ id +"&f=json" // JSON does not work
		path: "/xmlResult/" + id + "/"
	}, function(req){
		++pending;
		req.on('end',function(){
			--pending;
			++count;

			var xml;
			if(debug) console.log('\tresult http://'+webpagetest+'/result/'+id);
			try{
				xml = libxmljs.parseXmlString(result).get('//data/median').childNodes();
			}catch(err){
				console.log(id,'xml parse error:',err);
			};

			if(!xml || !xml.length){
			if(debug) console.log('cannot get completed test with id ',id,' due to xml problem: NOTE if the test was recently submitted it might not be finished');
				if(pending <= 0) save_tests()
				return;
			};

			var i = 0, j, l, m, item, child, data, children, set, s;
			l = xml.length, data = tests[id].result = {};
			var unwanted = /^(text|run)/;
			while(i<l){
				item = xml[i++];
				s = item.name();
				if(s == 'text') continue;
				set = data[s] = {};
				children = item.childNodes();
				j = 0;
				m = children.length;
				while(j<m){
					child = children[j++];
					s = child.name();
					if(unwanted.test(s)) continue;
					set[s] = child.text();
				};
			};

			if(debug) console.log('results for',id,'\n',data);

			if(pending <= 0) save_tests()

		}).on('data',function(res){
			result += res.toString();
		});
	});
};

function collect_test_results(){
	var test;
	for(var p in tests){
		test = tests[p];
		if(test.result){
			console.log('already have result for',test.id);
			continue;
		};
		get_completed_test_for(test.id);
	};
};

function setup_test_for(_path){
	if(debug) console.log('setup_test_for',_path);

	var browsers = testBrowsers;
	if(/mobileOn/.test(_path)) browsers = browsers.mobile;
	else browsers = browsers.desktop;

	for(var i=0,l=browsers.length;i<l;i++){
		submit_test({'browser': browsers[i], path: _path});
	};
};

function warm_stage(_path){
	if(debug) console.log('warm stage for',_path);
// make sure stage is working AND varnish has the url cached
	http.get({
		host: 'stage.wetpaint.me',
		port: 80,
		path: _path
	}, function(res){
		res.on('end',function(){
			if(res.statusCode != 200) return debug ? console.log('NOTE stage failed with',res.statusCode,'for',_path):0;
			if(debug) console.log('stage responded',res.statusCode,'to',_path);
			setup_test_for(_path);
		});
	});
};

function begin_tests(){
// setup url's and pass along
	if(debug) console.log('submitting tests for '+domain);
	var what = testPaths;
	var path;
	for(var i=0,l=what.length;i<l;i++){
		path = what[i];
		warm_stage(path + '?mobileOff');
		warm_stage(path + '?mobileOn');
	};
};

function save_tests(){
// save tests to file
	if(tests.constructor != Object) return;

	if(debug) console.log(count,'tests');
	var json = JSON.stringify(tests);
//	if(json == backup) return;
	fs.writeFile(filename, JSON.stringify(tests), function(err){
		if(debug) console.log( err ? ("error writing file:",err):("saved tests to:",filename));
	});
};

function hudson_continuous_integration_operations(){
	if(debug) console.log('hudson_continuous_integration_operations');
	collect_test_results();
	begin_tests();
	compare_data();
};

function get_saved_tests(){
	if(debug) console.log('get_saved_tests');
	var x = typeof fs.exists != 'undefined' ? fs : require('path');
	x.exists(filename, function(exists){
	function finished_loading(){
		if(_hudson_workspace){
			hudson_continuous_integration_operations();
		}else{
			handle_command_line_invocation();
		};
	}
	if(!exists) return finished_loading();
	fs.readFile(filename,'utf8',function(err, data){
		if(err){
			if(debug) console.log('error:', err);
			return;
		};
		try{
			tests = JSON.parse(data);
			backup = data;
		}catch(_err){
			if(debug) console.log('JSON.parse error:', _err,'\nwith:\n',data,'\ntests now:\n',tests);
		};

		if(debug) console.log('read data from file');

		finished_loading();
	});
	});
};

function report_json(){
	console.log(require('util').inspect(tests,false,null));
};

function compare_data(){
	var t, test, byUrl = {};
	var problems = [];
	// various attributes and values for the labels & data provided by webpagetest.org
	var desired = {
		TTFB:{label:'first-byte',max:400},
		docTime:{label:'document-ready',max:3000},
		render:{label:'start render',max:3000},
		fullyLoaded:{label:'loaded',max:6000},
		browser_name:{label:'browser'},
		browser_version:{label:'version'},
	};

	function results(view, test){
		var result = [], p, n, warn;
		view = test.result[view];
		for(p in view){
			if(!desired[p]) continue;
			n = view[p]*1;
			warn = (desired[p].max ? (isNaN(n) || n >= desired[p].max?'*':''):'')
			if(warn) problems.push('over limit for '+p+' of '+view[p]+' (max '+desired[p].max+') on '+test.url +' see http://'+webpagetest+'/'+test.id);
			result.push(desired[p].label + ': '+view[p] + (isNaN(n) ? '':'ms'), warn);
		};
		return result.join(', ');
	};

	for(t in tests){
		test = tests[t];
		console.log('test:', test.url);
		console.log((new Date(test.time)).toString(), ' http://'+webpagetest+'/'+test.id);
		if(!test.result){
			console.log('results: no results yet');
			continue;
		};
		console.log('first view:',results('firstView', test));
		console.log('repeat view:',results('repeatView', test));
		console.log('');
	};
	console.log('problems ('+problems.length+'):\n'+problems.join('\n')+'\n');
};

function handle_command_line_invocation(){
	var argv = process.argv, item, ok = 0;
	var options = {
		'new': "start new tests for all our url's",
		'process': 'go get recently-ran tests',
		'report': "print out what's known",
		'compare': "somehow compare the data",
	};
	function usage(){
		console.log('usage:\nnode script option');
		console.log('eg:\nnode '+__filename+' process');
		console.log('these are the options:\n',options);
	};
	outer: for(var i=1,l=argv.length;i<l;i++){
		item = argv[i];
		switch(item){
		case 'new':
// kick-off new tests for the testPaths
			++ok;
			begin_tests();
		break outer;
		case 'process':
// go get recently-ran tests
			++ok;
			collect_test_results();
		break outer;
		case 'report':
// just tell me what you have
			++ok;
			report_json();
		break outer;
		case 'compare':
// just tell me what you have
			++ok;
			compare_data();
		break outer;
		default:
		};
	};
	if(!ok) usage();
};

process.on('exit',function(){
	console.log('All done, have a great day!');
});

get_saved_tests();


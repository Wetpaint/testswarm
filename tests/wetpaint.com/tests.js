wp.modules.core = function(){
	$(function(){
		console.log(page,'title',page.document.title,'loc',page.location.href);
	});
};
wp.modules.likegate = function(){
	module('likegate');
	console.log('likegate, likes:',$.cookie('wpLikes'),', likegated?',$.cookie('wpLikegate'),', visit:',$.cookie('wpVisit'));

	asyncTest('likegate tests', function(){
		expect(3);
		function theTest(){
			equal($('#likegate').is(':visible'), true, 'likegate is showing');
			ok($('#likegate').parent()[0], 'likegate has a parent');
			equal(/\blikegate\b/.test($('#likegate').parent()[0].className), true, 'parent.likegate parentNode class includes "likegate"');
			
			start();
		};

		if(page.getElementById('likegate')) theTest();
		else $(page.wp).bind('likesdefined', theTest);
	});

};
wp.modules.domains = function(){
	module('wp.domains');

	var undef, p, domains = page.wp.domains, item, counts = {},
		networkfp = 'http://www.facebook.com/Wetpaint', networkfbid = '5510619796';

		function setupTest(){
		for(p in domains){
			item = domains[p];
			if(item.pilot) continue;

			if(!counts[item.fbid]) counts[item.fbid] = 1;
			else counts[item.fbid]++;
			if(!counts[item.fb_fan_page_url]) counts[item.fb_fan_page_url] = 1;
			else counts[item.fb_fan_page_url]++;
		};

		item = 0;
		for(p in counts){
			if(counts[p] > 1) item++;
		};
		}; // setupTest

		asyncTest('site/show object tests', function(){
			expect(6);
			function theTest(){
				$(page.wp).unbind('likesdefined',theTest);
				setupTest();
	
				equal(domains.network.fb_fan_page_url, networkfp,'network fanpage is ');
				equal(domains.network.fbid, networkfbid,'network facebook id is ');
				notEqual(domains.network.pilot, true, 'network is not a pilot');
				equal(counts[domains.network.fb_fan_page_url],1,'only one domain with the network fanpage');
				equal(counts[domains.network.fbid],1,'only one domain with the network facebook id');
				equal(item, 0, 'no duplicate facebook ids or fanpages');
	
				start();
			};

			if(domains.network.fb_fan_page_url.indexOf('http') != 0) $(page.wp).bind('likesdefined',theTest);
			else theTest();
		});

};

wp.tests.push(
{
	page:'/',
	run: function(){
		var module = wp.modules;
		module.core();
		module.domains();
	}
}, {
	page:'/network/gallery/red-carpet-alert-celebs-at-the-2011-trevor-live-event',
	before: function(){
		window.name = ''; $.cookie('wpLikes',''); $.cookie('wpLikegate',''); $.cookie('wpVisit',2);
	},
	run: function(){
		var module = wp.modules;
		module.core();
		module.domains();
		module.likegate();
	}
}
);

wp.modules.core = function(){
	$(function(){
		console.log('testing page',page,'title',page.document.title,'loc',page.location.href);
	});
};
wp.modules.clearCookies = function(){
	var w = page.wp, d = page.wp.domains, like, likes = ($.cookie('wpLikes')||'').split('-');
	while(like = likes.shift()){
		$(w).trigger('unlike', [{href:d[like].fb_fan_page_url, widget:{}}]);
	};
	$.cookie('wpLikes','', {path:'/',expires:120,domain:w._domain}); $.cookie('wpLikegate','', {path:'/',domain:w._domain}); $.cookie('wpVisit',2, {path:'/',domain:w._domain});
	page.wp.FB.saveLikes();
};
wp.modules.likegate = function(index, opt_out){
	module('likegate');
//	test('setup for showing likegate', function(){ expect(3); });

	page.scrollTo(0, 900);
console.log('opt_out',opt_out);
	asyncTest('likegate showing and dismiss on '.concat(opt_out,' click'), function(){
		expect(9);
		equal($.cookie('wpLikegate'), '', 'empty wpLikegate cookie (as though none came up this session)');
		equal($.cookie('wpVisit'), '2', 'wpVisit cookie = 2 (2nd pageview in session)');
		equal($.cookie('wpLikes'), '', 'empty wpLikes cookie (no liked shows)');
		var parent = $('#likegate').parent().get(0);
		function theTest(){
			var parent = $('#likegate').parent().get(0);
			ok(parent, 'likegate has a parent (exists on page)');
			equal($('#likegate').is(':visible'), true, 'likegate is showing');
			ok(' '.concat(parent.className.indexOf('likegate')), 'parentNode className includes "likegate":'.concat(parent.className));

			page.wp.__testlike = function(e, like){
				$(page.wp).unbind('like', page.wp.__testlike);
				equal(e.type, 'like', 'like event resulted from click on '.concat(opt_out,' option'));
				equal($('#likegate').is(':visible'), false, 'likegate closed as a result');
			};
			$(page.wp).bind('like',	page.wp.__like);
			page.wp.__testgaq = function(e, pushed){
				$(page.wp).unbind('_gaq',page.wp.__testgaq);
				var str = pushed.item.join(',');
				ok(str.indexOf(opt_out)+1, '_gaq.push got '.concat(opt_out,': ', str));
			};
			$(page.wp).bind('_gaq',page.wp.__testgaq);
			$('u','#likegate').eq(index).trigger('click');
			start();
		};

		if(!page._gaq._push) page._gaq._push = page._gaq.push;
		var slice = Array.prototype.slice;
		page._gaq.push = function(){
			var item, str,i=0,l=arguments.length;
			while(i<l){
				item = arguments[i++];
				if(/uiEvent.*_likegate/.test(item.join(','))) $(page.wp).trigger('_gaq',[{'item':item}]);
			};
			console.log('tracking:',slice.call(arguments, 0), wp, page); this._push.apply(this, slice.call(arguments, 0));
		};

/*
NO: _gaq._push = _gaq.push; _gaq.push=function(){ _gaq._push.apply(_gaq, Array.prototype.concat.apply([], arguments)); }
YES: _gaq._push = _gaq.push; _gaq.push=function(n){ _gaq._push.call(_gaq, n); }
_gaq.push( ['globalTracker._trackEvent', 'testing', 'test', 'ping-ping', 1, true] );
if(!_gaq._push) _gaq._push = _gaq.push; _gaq.push = function(){ console.log(this); this._push.apply(this, Array.prototype.concat.apply([], arguments)); };
_gaq.push( ['globalTracker._trackEvent', 'testing', 'test', 'ping-ping', 1, true] );
if(!_gaq._push) _gaq._push = _gaq.push; _gaq.push = function(){ console.log(this); this._push.apply(this, Array.prototype.slice.call(arguments, 0)); };
_gaq.push( ['globalTracker._trackEvent', 'testing', 'test', 'ping-ping', 1, true], ['globalTracker._trackEvent', 'testing', 'test', 'ping-', 1, true], ['globalTracker._trackEvent', 'testing', 'test', 'ping-ing', 1, true] );
 * */

		// TODO need a better way to set this up, possibly page.wp.FB.readyState ?
		setTimeout(function(){
			theTest();
//			if(parent && parent.className.indexOf('likegate') + 1) theTest(); else $(page.wp).bind('likesdefined', theTest);
		}, 2000);
	});

};
wp.modules.domains = function(option){
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
	},
	after: wp.modules.clearCookies
},
/*
{
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
},
*/
{
	page:'/bones/articles/wetpaint-exclusive-bones-cast-reveals-how-things-will-change-forever',
	before: wp.modules.clearCookies,
	run: function(){
		var module = wp.modules;
		module.core();
		module.domains();
		module.likegate(0,'already-like');
	},
	after: wp.modules.clearCookies
}/*,
{
	page:'/americas-next-top-model/articles/why-was-angelea-disqualified-from-americas-next-top-model-allstars',
	before: wp.modules.clearCookies,
	run: function(){
		var module = wp.modules;
		module.core();
		module.domains();
		module.likegate(1,'prefer-twitter');
	},
	after: wp.modules.clearCookies
}
*/
);

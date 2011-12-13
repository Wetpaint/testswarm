wp.modules.core = function(){
	$(function(){
		console.log('testing page',page,'title',page.document.title,'loc',page.location.href);
	});
};
wp.modules.setupAndOpenLikegate = function(){
console.log('autostart?',QUnit.config.autostart);
	var w = page.wp;
	$.cookie('wpLikegate','', {path:'/',domain:w._domain}); $.cookie('wpVisit',2, {path:'/',domain:w._domain});
	if(w.domains[w.store_name].like){
		$(w).trigger('unlike', [{href:w.domains[w.store_name].fb_fan_page_url, widget:{}}]).trigger('likegate');
	};
console.log('ping ...');
};

wp.modules.likegate = function(index, opt_out){
	module('likegate');
	var w = page.wp;
	asyncTest('likegate showing and dismiss on '.concat(opt_out,' click'), function(){
		expect(10);
		stop(3);
		equal($.cookie('wpLikegate'), '', 'empty wpLikegate cookie (as though none came up this session)');
		equal($.cookie('wpVisit'), '2', 'wpVisit cookie = 2 (2nd pageview in session)');
		equal(($.cookie('wpLikes')||'').indexOf(w.domains[w.store_name].key), -1, 'current show not in wpLikes cookie');
		var parent = $('#likegate').parent().get(0);
		function theTest(e){
			var parent = $('#likegate').parent().get(0);
			ok(parent, 'likegate has a parent (exists on page)');
			ok(!w.domains[w.store_name].like, 'current show is not liked');
			ok(/\blikegate\b/.test(parent.className), 'parentNode className includes "likegate":'.concat(parent.className));
			equal($('#likegate').is(':visible'), true, 'likegate is showing');

			w._testlike = function(e, like){
console.log('like..');
				$(w).unbind('like', w._testlike);

				equal(e.type, 'like', 'like event resulted from click on '.concat(opt_out,' option'));
				equal($('#likegate').is(':visible'), false, 'likegate closed as a result');
				start();
			};
			w._testgaq = function(e, pushed){
console.log('_gaq..');
				var str = pushed.item.join(',');
				ok(str.indexOf(opt_out)+1, '_gaq.push got '.concat(opt_out,': ', str));
				start();
			};
			$(w).bind('_gaq',w._testgaq).bind('like',	w._testlike);

			$('u','#likegate').eq(index).each(function(){
				var l = $(this), count = 0, fade = function(){
					if(count>7){
						l.trigger('click');
						start();
						return;
					};
					l.animate({opacity:count % 2 == 0 ? 0:1}, 400, fade); count++;
				};
				l.css({opacity:1}); fade();
			});
			QUnit.start();
		};

		if(!page._gaq._push) page._gaq._push = page._gaq.push;
		var slice = Array.prototype.slice;
		page._gaq.push = function(){
			var item, str,i=0,l=arguments.length;
			while(i<l){
				item = arguments[i++];
				if(/uiEvent.*_likegate/.test(item.join(','))) $(page.wp).trigger('_gaq',[{'item':item}]);
			};
			//console.log('GA tracking',arguments.length,'items:',slice.call(arguments, 0)); this._push.apply(this, slice.call(arguments, 0));
		};

		page.scrollTo(0, 900);
		if(w.FB.likesdefined) setTimeout(theTest, 2000, 1);
		else $(w).bind('likesdefined', theTest);
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
	
				QUnit.start();
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
		QUnit.start();
	}
},
{
	page:'/network/gallery/red-carpet-alert-celebs-at-the-2011-trevor-live-event',
	before: wp.modules.setupAndOpenLikegate,
	run: function(){
		var module = wp.modules;
		module.core();
		module.domains();
		module.likegate();
	}
},
{
	page:'/bones/articles/wetpaint-exclusive-bones-cast-reveals-how-things-will-change-forever',
	before: wp.modules.setupAndOpenLikegate,
	run: function(){
		var module = wp.modules;
		module.core();
		module.domains();
		module.likegate(0,'already-like');
	},
	after: function(){
		console.log('after...');
//	debugger;
	}
}/*,
{
	page:'/americas-next-top-model/articles/why-was-angelea-disqualified-from-americas-next-top-model-allstars',
	before: wp.modules.setupAndOpenLikegate,
	run: function(){
		var module = wp.modules;
		module.core();
		module.domains();
		module.likegate(1,'prefer-twitter');
	},
	after: wp.modules.setupAndOpenLikegate
}
*/
);

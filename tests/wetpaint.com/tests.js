et.modules.core = function(){
pavlov.specify('a wetpaint.com page', function(){
	describe('has certain features', function(){
		it("has a footer", function(){
			assert($('#footer').length).equals(1,'$("#footer") returns an element');
		});
		it("has a title",function(){
			assert(page.document.title).isTrue(page.document.title);
		});
		it("is a valid location", function(){
			assert(/wetpaint/.test(page.location)).isTrue(page.location);
		});
	});
});
};
et.modules.setupAndOpenLikegate = function(){
console.log('autostart?',QUnit.config.autostart);
	$.cookie('wpLikegate','', {path:'/',domain:wp._domain});
	$.cookie('wpVisit',2, {path:'/',domain:wp._domain});
	if(wp.domains[wp.store_name].like){
		$(wp).trigger('unlike', [{href:wp.domains[wp.store_name].fb_fan_page_url, widget:{}}]).trigger('likegate');
console.log('trigger');
	};
};

QUnit.specify.globalApi = true;
et.modules.example = function(){
/*
// debug 
console.log('example');
pavlov.specify('An Exampleee',function(){
describe('a feature is described',function(){
	var __state;
	before(function(){
		__state = 'before';
		console.log('before:',__state);
	});
	after(function(){
		__state = 'after';
		console.log('after:',__state);
	});

	it('is in the running __state',function(){
	__state = 'running';
console.log('--state',__state);
		assert(__state).equals('running');
	});
	it('is Not Implemented');
	it('is arbitrary',function(){
	__state = 'running';
console.log('--state',__state);
		var n = 5;
		assert(n).equals(5);
	});
});
});
*/
};

et.modules.likegate = function(index, opt_out){
pavlov.specify('Likegate testing', function(){
	describe('article likegate behavior', function(){
		it("yep, it's an article", function(){
			assert(wp.controller).equals('article');
			assert(wp.action).equals('show');
		});
		it('and has a likegate', async(function(){
		function test(){
			assert($('#likegate').length).equals(1,'$("#likegate") returns an element');
			resume();
		};
		if(wp.FB.likesdefined) test();
		else $(wp).bind('likesdefined', test);
		}));
	});
});
/*
		equal($.cookie('wpLikegate'), '', 'empty wpLikegate cookie (as though none came up this session)');
		equal($.cookie('wpVisit'), '2', 'wpVisit cookie = 2 (2nd pageview in session)');
		equal(($.cookie('wpLikes')||'').indexOf(wp.domains[wp.store_name].key), -1, 'current show not in wpLikes cookie');
		var parent = $('#likegate').parent().get(0);
		function theTest(e){
			var parent = $('#likegate').parent().get(0);
			ok(parent, 'likegate has a parent (exists on page)');
			ok(!wp.domains[wp.store_name].like, 'current show is not liked');
console.log('parent',parent);
			ok(/\blikegate\b/.test(parent.className), 'parentNode className includes "likegate":'.concat(parent.className));
			equal($('#likegate').is(':visible'), true, 'likegate is showing');

			wp._testlike = function(e, like){
console.log('like..');
				$(wp).unbind('like', wp._testlike);

				equal(e.type, 'like', 'like event resulted from click on '.concat(opt_out,' option'));
				equal($('#likegate').is(':visible'), false, 'likegate closed as a result');
				start();
			};
			wp._testgaq = function(e, pushed){
console.log('_gaq..');
				var str = pushed.item.join(',');
				ok(str.indexOf(opt_out)+1, '_gaq.push got '.concat(opt_out,': ', str));
				start();
			};
			$(wp).bind('_gaq',wp._testgaq).bind('like',	wp._testlike);

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
			;
			//console.log('GA tracking',arguments.length,'items:',slice.call(arguments, 0)); this._push.apply(this, slice.call(arguments, 0));
		};

		page.scrollTo(0, 900);
		if(wp.FB.likesdefined) setTimeout(theTest, 2000, 1);
		else $(wp).bind('likesdefined', theTest);
	});
*/
};

et.modules.domains = function(option){
pavlov.specify('wp.domains testing', function(){
describe('wp.domains', function(){

		it('should have the right entries and data', async(function(){
		var wp = page.wp, p, domains = wp.domains, item, counts = {},
			networkfp = 'http://www.facebook.com/Wetpaint', networkfbid = '5510619796';
		function test(e){
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
			assert(domains.network.fb_fan_page_url).equals(networkfp);
			assert(domains.network.fbid).equals(networkfbid);
			//it("there's only 1 network and it isn't a pilot", function(){
			assert(domains.network.pilot).equals(false);
			assert(counts[domains.network.fb_fan_page_url]).equals(1, 'there is only one domain member with the network fanpage');
			assert(counts[domains.network.fbid]).equals(1,'there is only domain with the network fbid');
			//it("shouldn't have any duplicate facebook id's or fan pages", function(){
			assert(item).equals(0);
			resume();
		};
		if(wp.FB.likesdefined) test();
		else $(wp).bind('likesdefined', test);
		}));
});
});
};

et.tests.push(
{
	page:'/',
	run: function(){
		var module = et.modules;
		module.core();
		module.domains();
	}
},
{
	page:'/network/gallery/red-carpet-alert-celebs-at-the-2011-trevor-live-event',
	run: function(){
		var module = et.modules;
		module.core();
		module.domains();
	}
},
{
	page:'/bones/articles/wetpaint-exclusive-bones-cast-reveals-how-things-will-change-forever#show_likegate',
	run: function(){
		et.modules.setupAndOpenLikegate;
		var module = et.modules;
		module.core();
		module.domains();
		module.likegate(0,'already-like');
	}
},
{
	page:'/americas-next-top-model/articles/why-was-angelea-disqualified-from-americas-next-top-model-allstars',
	run: function(){
		et.modules.setupAndOpenLikegate;
		var module = et.modules;
		module.core();
		module.domains();
		module.likegate(1,'prefer-twitter');
	}
}
);

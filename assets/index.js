$(document).ready(function ($) {
	$('.section_base .button_show_tab').on('click', function(e){
		e.preventDefault();
		var $this = $(this);
		$this.parents('.section_base .section-head').find('.viewallcat').stop().slideToggle();
		$(this).toggleClass('active')
		return false;
	});
	$('.add_to_cart').click(function(e){	
		e.preventDefault();		
		var $this = $(this);
		var form = $this.parents('form');	
		$.ajax({
			type: 'POST',
			url: '/cart/add.js',
			async: false,
			data: form.serialize(),
			dataType: 'json',
			beforeSend: function() { },
			success: function(line_item) {
				ajaxCart.load();
				$('.popup-cart-mobile, .backdrop__body-backdrop___1rvky').addClass('active');
				AddCartMobile(line_item);
			},
			cache: false
		});
	});
});
function callbackFuncGroup(sectionName) {
	awe_lazyloadImage();
	$('.'+sectionName+' .add_to_cart').click(function(e){	
		e.preventDefault();		
		var $this = $(this);
		var form = $this.parents('form');	
		$.ajax({
			type: 'POST',
			url: '/cart/add.js',
			async: false,
			data: form.serialize(),
			dataType: 'json',
			beforeSend: function() { },
			success: function(line_item) {
				ajaxCart.load();
				$('.popup-cart-mobile, .backdrop__body-backdrop___1rvky').addClass('active');
				AddCartMobile(line_item);
			},
			cache: false
		});
	});
	
	runQuickView();
	
	
	favoriBean.Wishlist.activityWishlist();
	
	if(window.BPR && window.BPR.loadBadges){
		window.BPR.initDomEls()
		window.BPR.loadBadges()
	}
}
/*Ajax tab 1*/
$(".not-dqtab").each( function(e){
	/*khai báo khởi tạo ban đầu cho 2 kiểu tab*/
	var $this1 = $(this);
	var $this2 = $(this);
	var datasection = $this1.closest('.not-dqtab').attr('data-section');
	$this1.find('.tabs-title li:first-child').addClass('current');
	$this1.find('.tab-content').first().addClass('current');
	var datasection2 = $this2.closest('.not-dqtab').attr('data-section-2');
	$this2.find('.tabs-title li:first-child').addClass('current');
	$this2.find('.tab-content').first().addClass('current');

	/*khai báo cho chức năng dành cho mobile tab*/
	var _this = $(this).find('.wrap_tab_index .title_module_main');
	var droptab = $(this).find('.link_tab_check_click');

	/*type 1*/ //kiểu 1 này thì load có owl carousel
	$this1.find('.tabtitle1.ajax li').click(function(){
		var $this2 = $(this),
			tab_id = $this2.attr('data-tab'),
			url = $this2.attr('data-url');
		var etabs = $this2.closest('.e-tabs');
		etabs.find('.tab-viewall').attr('href',url);
		etabs.find('.tabs-title li').removeClass('current');
		etabs.find('.tab-content').removeClass('current');
		$this2.addClass('current');
		etabs.find("."+tab_id).addClass('current');
		//Nếu đã load rồi thì không load nữa
		if(!$this2.hasClass('has-content')){
			$this2.addClass('has-content');		
			getContentTab(url,"."+ datasection+" ."+tab_id);
		}
	});
	$this2.find('.tabtitle2.ajax li').click(function(){
		var $this2 = $(this),
			tab_id = $this2.attr('data-tab'),
			url = $this2.attr('data-url');
		var etabs = $this2.closest('.e-tabs');
		etabs.find('.tab-viewall').attr('href',url);
		etabs.find('.tabs-title li').removeClass('current');
		etabs.find('.tab-content').removeClass('current');
		$this2.addClass('current');
		etabs.find("."+tab_id).addClass('current');
		//Nếu đã load rồi thì không load nữa
		if(!$this2.hasClass('has-content')){
			$this2.addClass('has-content');		
			getContentTab2(url,"."+ datasection2+" ."+tab_id);
		}
	});

});

// Get content cho tab
function getContentTab(url,selector){
	url = url+"?view=ajaxload";
	var loading = '<div class="a-center"><img src="//bizweb.dktcdn.net/100/669/966/themes/1120993/assets/rolling.svg?1777455765633" alt="loading"/></div>';
	$.ajax({
		type: 'GET',
		url: url,
		beforeSend: function() {
			$(selector).html(loading);
		},
		success: function(data) {
			var content = $(data);
			setTimeout(function(){
				$(selector).html(content.html());
				ajaxSwiper(selector);
				callbackFuncGroup();
				$(selector + ' .add_to_cart').click(function(e){
					e.preventDefault();		
					var $this = $(this);
					var form = $this.parents('form');	
					$.ajax({
						type: 'POST',
						url: '/cart/add.js',
						async: false,
						data: form.serialize(),
						dataType: 'json',
						beforeSend: function() { },
						success: function(line_item) {
							ajaxCart.load();
							$('.popup-cart-mobile, .backdrop__body-backdrop___1rvky').addClass('active');
							AddCartMobile(line_item);
						},
						cache: false
					});
				});
			},500);
		},
		dataType: "html"
	});
}
// Get content cho tab
function getContentTab2(url,selector){
	url = url+"?view=ajaxload2";
	var loading = '<div class="row"><div class="col-xl-3 col-lg-3 col-md-3 col-sm-6 col-xs-12 item_null"><div class="item_product_main"></div></div><div class="col-xl-3 col-lg-3 col-md-3 col-sm-6 col-xs-12 item_null"><div class="item_product_main"></div></div><div class="col-xl-3 col-lg-3 col-md-3 col-sm-6 col-xs-12 item_null item_null"><div class="item_product_main"></div></div><div class="col-xl-3 col-lg-3 col-md-3 col-sm-6 col-xs-12 item_null item_null"><div class="item_product_main"></div></div><div class="col-xl-3 col-lg-3 col-md-3 col-sm-6 col-xs-12 item_null item_null"><div class="item_product_main"></div></div><div class="col-xl-3 col-lg-3 col-md-3 col-sm-6 col-xs-12 item_null item_null"><div class="item_product_main"></div></div><div class="col-xl-3 col-lg-3 col-md-3 col-sm-6 col-xs-12 item_null item_null"><div class="item_product_main"></div></div><div class="col-xl-3 col-lg-3 col-md-3 col-sm-6 col-xs-12 item_null item_null"><div class="item_product_main"></div></div></div>';
	$.ajax({
		type: 'GET',
		url: url,
		beforeSend: function() {
			$(selector).html(loading);
		},
		success: function(data) {
			var content = $(data);
			setTimeout(function() {
				if ($(content).length === 1 && $(content[0]).hasClass('is-collection-ajax')) {
					$(selector).html(content.html());
					callbackFuncGroup();
					if (window.BPR)
						window.BPR.initDomEls(), window.BPR.loadBadges();
					$(selector + ' .add_to_cart').click(function(e) {
						e.preventDefault();
						var $this = $(this);
						var form = $this.parents('form');
						$.ajax({
							type: 'POST',
							url: '/cart/add.js',
							async: false,
							data: form.serialize(),
							dataType: 'json',
							beforeSend: function() {},
							success: function(line_item) {
								ajaxCart.load();
								$('.popup-cart-mobile, .backdrop__body-backdrop___1rvky').addClass('active');
								AddCartMobile(line_item);
							},
							cache: false
						});
					});
				}
				else {
					$(selector).html('<div class="alert alert-warning alert-dismissible show margin-bottom-0" role="alert"> <span>Hiện tại chưa có sản phẩm nào trong danh mục này!...</span> </div>');
				}
			}, 500);
		},
		dataType: "html"
	});
}
// Ajax carousel
function ajaxSwiper(selector,dataLgg){
	$(selector+' .swipertab').each( function(){
		var swiperTab = new Swiper('.swipertab', {
			slidesPerView: 5,
			spaceBetween: 20,
			slidesPerColumn: 2,
			slidesPerColumnFill: 'row',
			breakpoints: {
				300: {
					slidesPerView: 2,
					slidesPerColumnFill: 'row',
					slidesPerColumn: 2,
					spaceBetween: 20
				},
				767: {
					slidesPerView: 2,
					slidesPerColumnFill: 'row',
					slidesPerColumn: 2,
					spaceBetween: 20
				},
				768: {
					slidesPerView: 2,
					spaceBetween: 20
				},
				1024: {
					slidesPerView: 5,
					spaceBetween: 20
				}
			}
		});
	})
}
function ajaxSwiper2(selector,dataLgg){
	$(selector+' .swipertab2').each( function(){
		var swiperTab = new Swiper('.swipertab2', {
			slidesPerView: 3,
			spaceBetween: 20,
			slidesPerColumn: 2,
			slidesPerColumnFill: 'row',
			breakpoints: {
				300: {
					slidesPerView: 2,
					slidesPerColumnFill: 'row',
					slidesPerColumn: 2,
					spaceBetween: 20
				},
				767: {
					slidesPerView: 2,
					slidesPerColumnFill: 'row',
					slidesPerColumn: 2,
					spaceBetween: 20
				},
				768: {
					slidesPerView: 2,
					spaceBetween: 20
				},
				1024: {
					slidesPerView: 3,
					spaceBetween: 20
				}
			}
		});
	})
}
window.addEventListener('DOMContentLoaded', (event) => {
	var swiperCarousel = new Swiper('.swiper-carousel', {
		slidesPerView: 5,
		spaceBetween: 20,
		slidesPerColumn: 2,
		slidesPerColumnFill: 'row',
		breakpoints: {
			300: {
				slidesPerView: 2,
				slidesPerColumnFill: 'row',
				slidesPerColumn: 2,
				spaceBetween: 20
			},
			767: {
				slidesPerView: 2,
				slidesPerColumnFill: 'row',
				slidesPerColumn: 2,
				spaceBetween: 20
			},
			768: {
				slidesPerView: 3,
				spaceBetween: 20
			},
			1024: {
				slidesPerView: 4,
				spaceBetween: 20
			},
			1200: {
				slidesPerView: 5,
				spaceBetween: 20
			}
		}
	});
});
window.addEventListener('DOMContentLoaded', (event) => {
	var swiperCarousel = new Swiper('.swiper-carousel2', {
		slidesPerView: 3,
		spaceBetween: 20,
		slidesPerColumn: 2,
		slidesPerColumnFill: 'row',
		breakpoints: {
			300: {
				slidesPerView: 2,
				slidesPerColumnFill: 'row',
				slidesPerColumn: 2,
				spaceBetween: 20
			},
			767: {
				slidesPerView: 2,
				slidesPerColumnFill: 'row',
				slidesPerColumn: 2,
				spaceBetween: 20
			},
			768: {
				slidesPerView: 2,
				spaceBetween: 20
			},
			1024: {
				slidesPerView: 3,
				spaceBetween: 20
			}
		}
	});
});

$(".li-kmdiscount").click(function() {
	$('html, body').animate({
		scrollTop: $("#index_flash_sale").offset().top
	}, 1000);
});


function lazyBlockProduct(sectionName, rootMargin, callback) {
	var section = $('.' + sectionName);
	var template = $('script[data-template="' + sectionName + '"]').html();

	var observer = new IntersectionObserver(function(entries) {
		entries.forEach(function(entry) {
			if (entry.isIntersecting) {
				$('div[data-section="' + sectionName + '"]', entry.target).html(template);
				observer.unobserve(entry.target);
				callbackFuncGroup(sectionName);
				if (typeof callback === 'function') {
					callback();
				}
			}
		});
	}, { rootMargin: rootMargin });

	observer.observe(section.get(0));
}
document.addEventListener('DOMContentLoaded', () => {
	const wrappers = document.querySelectorAll('.animation_image');
	if (!wrappers.length) return;
	const observer = new IntersectionObserver((entries) => {
		entries.forEach(entry => {
			const img = entry.target.querySelector('img');
			if (!img) return;
			if (entry.isIntersecting) {
				img.classList.add('visible');
			} else {
				//img.classList.remove('visible');
			}
		});
	}, {
		threshold: 0.2
	});
	wrappers.forEach(el => observer.observe(el));
});
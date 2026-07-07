var selectedSortby;
var tt = 'Thứ tự';

var filter = new Bizweb.SearchFilter()

if(colId > 0){
	filter.addValue("collection", "collections", colId, "AND");
}

function toggleFilter(e) {
	_toggleFilter(e);
	renderFilterdItems();
	resortby(selectedSortby);
	doSearch(1);
}
function _toggleFilterdqdt(e) {
	var $element = $(e);
	var group = 'Khoảng giá';
	var field = 'price_min';
	var operator = 'OR';	 
	var value = $element.attr("data-value");	

	filter.deleteValuedqdt(group, field, value, operator);
	filter.addValue(group, field, value, operator);
	renderFilterdItems();
	doSearch(1);
}

function _toggleFilter(e){
	var $element = $(e);
	var group = $element.attr("data-group");
	var field = $element.attr("data-field");
	var text = $element.attr("data-text");
	var value = $element.attr("value");
	var operator = $element.attr("data-operator");
	var filterItemId = $element.attr("id");



	if (!$element.is(':checked')) {
		filter.deleteValue(group, field, value, operator);
	}
	else{
		filter.addValue(group, field, value, operator);
	}

	$(".catalog_filters li[data-handle='" + filterItemId + "']").toggleClass("active");
}

function renderFilterdItems() {
	var $container = $(".filter-container__selected-filter-list ul");
	$container.html("");

	$(".filter-container input[type=checkbox]").each(function(index) {
		if ($(this).is(':checked')) {
			var id = $(this).attr("id");
			var name = $(this).closest("label").text();

			addFilteredItem(name, id);
		}
	});

	if($(".filter-container input[type=checkbox]:checked").length > 0)
		$(".filter-container__selected-filter").show();
	else
		$(".filter-container__selected-filter").hide();
}
function addFilteredItem(name, id) {
	var filteredItemTemplate = "<li class='filter-container__selected-filter-item' for='{3}'><a href='javascript:void(0)' onclick=\"{0}\" title='{4}'><i class='fa fa-close'></i> {1}</a></li>";
	filteredItemTemplate = filteredItemTemplate.replace("{0}", "removeFilteredItem('" + id + "')");
	filteredItemTemplate = filteredItemTemplate.replace("{1}", name);
	filteredItemTemplate = filteredItemTemplate.replace("{3}", id);
	filteredItemTemplate = filteredItemTemplate.replace("{4}", name);
	var $container = $(".filter-container__selected-filter-list ul");
	$container.append(filteredItemTemplate);
}
function removeFilteredItem(id) {
	$(".filter-container #" + id).trigger("click");
}

function doSearch(page, options) {
	if(!options) options = {};
	//NProgress.start();
	$('.aside.aside-mini-products-list.filter').removeClass('active');
	awe_showPopup('.loading');
	filter.search({
		view: selectedViewData,
		page: page,
		sortby: selectedSortby,
		success: function (html) {
			var $html = $(html);
			// Muốn thay thẻ DIV nào khi filter thì viết như này
			var $categoryProducts = $($html[0]); 
			$(".category-products").html($categoryProducts.html());
			pushCurrentFilterState({sortby: selectedSortby, page: page});
			awe_hidePopup('.loading');				  
			awe_lazyloadImage();
			awe_category();
			
			favoriBean.Wishlist.wishlistProduct();
			

	beanComprare.Compare.compareProduct();
	
			$('.btn-filter').click(function(){
				$(".left-content").toggleClass('active');
				$(".backdrop__body-backdrop___1rvky").addClass('active');
			});
			if($(window).width() <= 991) {
				$('.sort-cate-right h3').on('click', function(e){
					e.preventDefault();var $this = $(this);
					$this.parents('.sort-cate-right').find('ul').stop().slideToggle();
					$(this).toggleClass('active');
					return false;
				});	
			}
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
			$('html, body').animate({
				scrollTop: $('.block-collection').offset().top - 80
			}, 0);
			$('#open-filters').removeClass('openf');
			$('.dqdt-sidebar').removeClass('openf');
			$('.opacity_sidebar').removeClass('openf');
			resortby(selectedSortby);
			$(document).ready(function () {
				var modal = $('.quickview-product');
				var btn = $('.quick-view');
				var span = $('.quickview-close');

				btn.click(function () {
					modal.show();
				});

				span.click(function () {
					modal.hide();
				});

				$(window).on('click', function (e) {
					if ($(e.target).is('.modal')) {
						modal.hide();
					}
				});
			});
			var _0xa1c3=["\x74\x68\x65\x6D\x65"];window[_0xa1c3[0]]= window[_0xa1c3[0]]|| {}
			theme.wishlist = (function (){
				var wishlistButtonClass = '.js-btn-wishlist',
					wishlistRemoveButtonClass = '.js-remove-wishlist',
					$wishlistCount = $('.js-wishlist-count'),
					$wishlistContainer = $('.js-wishlist-content'),
					$wishlistSmall = $('.wish-list-small'),
					wishlistViewAll = $('.wish-list-button-all'),
					wishlistObject = JSON.parse(localStorage.getItem('localWishlist')) || [],
					wishlistPageUrl = $('.js-wishlist-link').attr('href'),
					loadNoResult = function (){
						$wishlistContainer.html('<div class="col text-center"><div class="alert alert-warning d-inline-block"><p>Chưa có sản phẩm yêu thích! Hãy lựa chọn những sản phẩm ưa thích của mình nào.</p></div></div>');
						$wishlistSmall.html('<div class="empty-description"><span class="empty-icon"><i class="ico ico-favorite-heart"></i></span><div class="empty-text"><p>Chưa có sản phẩm yêu thích! Hãy lựa chọn những sản phẩm ưa thích của mình nào.</p></div></div><style>.container--wishlist .js-wishlist-content{border:none;}</style>');
						wishlistViewAll.addClass('d-none');
					};
				function loadSmallWishList(){
					$wishlistSmall.html('');
					if(wishlistObject.length > 0){
						for (var i = 0; i < wishlistObject.length; i++) { 
							var productHandle = wishlistObject[i];
							Bizweb.getProduct(productHandle,function(product){
								var htmlSmallProduct = '';
								if(product.variants[0].price > 0 ){
									var productPrice = Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.variants[0].price);
								}else{
									var productPrice = "Liên hệ";
								}
								if(product.featured_image != null){
									var src = product.featured_image;
								}else{
									var src = "//bizweb.dktcdn.net/thumb/large/assets/themes_support/noimage.gif";
								}
								htmlSmallProduct += '<div class="wish-list-item-small js-wishlist-item clearfix">';
								htmlSmallProduct += '<a class="product-image" href="'+ product.url +'" title="'+ product.name +'">';
								htmlSmallProduct += '<img class="lazyload" alt="'+ product.name +'" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXYzh8+PB/AAffA0nNPuCLAAAAAElFTkSuQmCC" data-src="'+ src +'" width="370" height="480"></a>';
								htmlSmallProduct += '<div class="detail-item"><div class="product-details">';
								htmlSmallProduct += '<a href="javascript:;" data-handle="'+product.alias+'" title="Bỏ yêu thích" class="js-remove-wishlist">×</a>';
								htmlSmallProduct += '<p class="product-name">';
								htmlSmallProduct += '<a href="'+ product.url +'" title="'+ product.name +'">'+ product.name +'</a>';
								htmlSmallProduct += '</p></div><div class="product-details-bottom">';
								htmlSmallProduct += '<span class="price pricechange">' +productPrice+ '</span>';
								htmlSmallProduct += '</div></div></div>';
								$wishlistSmall.append(htmlSmallProduct);
								awe_lazyloadImage();
							});
						}
						wishlistViewAll.removeClass('d-none');
					}else{
						loadNoResult();
					}
				}
				function loadWishlist(){
					$wishlistContainer.html('');
					if (wishlistObject.length > 0){
						for (var i = 0; i < wishlistObject.length; i++) { 
							var productHandle = wishlistObject[i];
							Bizweb.getProduct(productHandle,function(product){
								var htmlProduct = '';
								var i;
								if(product.variants[0].price > 0 ){
									var productPrice = Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.variants[0].price);
								}else{
									var productPrice = "Liên hệ";
								}
								if(product.variants[0].compare_at_price > product.variants[0].price ){
									var productPriceCompare = Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.variants[0].compare_at_price);
									var productDiscount = Math.round((product.variants[0].compare_at_price - product.variants[0].price)/product.variants[0].compare_at_price * 100);
								}
								if(product.featured_image != null){
									var src = Bizweb.resizeImage(product.featured_image, 'large');
								}else{
									var src = "//bizweb.dktcdn.net/thumb/large/assets/themes_support/noimage.gif";
								}

								htmlProduct += '<div class="col-6 col-sm-6 col-md-4 col-lg-3 item_product_main js-wishlist-item">';
								htmlProduct += '<div class="product-thumbnail">';
								htmlProduct += '<a class="image_thumb" href="'+ product.url +'" title="'+ product.name +'">';
								htmlProduct += '<img class="lazyload" width="370" height="480" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXYzh8+PB/AAffA0nNPuCLAAAAAElFTkSuQmCC" data-src="'+ src +'" alt="'+ product.name +'" />';
								htmlProduct += '</a>';
								if(product.variants[0].compare_at_price > product.variants[0].price ){
									htmlProduct += '<span class="smart">-' +productDiscount+ '%</span>';
								}
								htmlProduct += '<button type="button" class="favorites-btn favorites-btn-cus js-favorites js-remove-wishlist cart-button" title="Bỏ yêu thích" data-handle="'+product.alias+'"><img width="25" height="25" class="fash-added" src="https://bizweb.dktcdn.net/100/451/884/themes/857425/assets/heartadd.png?1649958365417"/></button></div>';
								htmlProduct += '<div class="product-info"><h3 class="product-name"><a href="'+ product.url +'" title="'+ product.name +'">'+ product.name +'</a></h3>';					
								htmlProduct += '<div class="price-box">';
								htmlProduct += '<span class="price">' +productPrice+ '</span>';
								if(product.variants[0].compare_at_price > product.variants[0].price ){
									htmlProduct += '<span class="compare-price">' +productPriceCompare+ '</span>';
								}
								htmlProduct += '</div>';
								htmlProduct += '</div>';
								$wishlistContainer.append(htmlProduct);
								awe_lazyloadImage();
							});
						}
					}else{
						loadNoResult();
					}
					$wishlistCount.text(wishlistObject.length);
					$(wishlistButtonClass).each(function(){
						var productHandle = $(this).data('handle');
						var iconWishlist = $.inArray(productHandle,wishlistObject) !== -1 ? "<img class='fash-added' alt='Đến trang sản phẩm yêu thích' width='25' height='25' src='https://bizweb.dktcdn.net/100/451/884/themes/857425/assets/heartadd.png?1649958365417'/>" : "<img alt='Thêm vào yêu thích' width='25' height='25' src='https://bizweb.dktcdn.net/100/601/974/themes/1052399/assets/heart.png?1767751037296'/>";
						var textWishlist = $.inArray(productHandle,wishlistObject) !== -1 ? "Đến trang sản phẩm yêu thích" : "Thêm vào yêu thích";
						$(this).html(iconWishlist).attr('title',textWishlist);
					});
				}
				var _0xcd91=["\x68\x61\x6E\x64\x6C\x65","\x64\x61\x74\x61","\x5B\x64\x61\x74\x61\x2D\x68\x61\x6E\x64\x6C\x65\x3D\x22","\x22\x5D","\x69\x6E\x41\x72\x72\x61\x79","\x68\x72\x65\x66","\x6C\x6F\x63\x61\x74\x69\x6F\x6E","\x70\x75\x73\x68","\x77\x69\x73\x68\x6C\x69\x73\x74\x49\x63\x6F\x6E\x41\x64\x64\x65\x64","\x73\x74\x72\x69\x6E\x67\x73","\x68\x74\x6D\x6C","\x66\x61\x73\x74","\x66\x61\x64\x65\x49\x6E","\x73\x6C\x6F\x77","\x66\x61\x64\x65\x4F\x75\x74","\x74\x69\x74\x6C\x65","\x77\x69\x73\x68\x6C\x69\x73\x74\x54\x65\x78\x74\x41\x64\x64\x65\x64","\x61\x74\x74\x72","\x6C\x6F\x63\x61\x6C\x57\x69\x73\x68\x6C\x69\x73\x74","\x73\x74\x72\x69\x6E\x67\x69\x66\x79","\x73\x65\x74\x49\x74\x65\x6D","\x6C\x65\x6E\x67\x74\x68","\x74\x65\x78\x74"];function updateWishlist(_0xfc06x2){var _0xfc06x3=$(_0xfc06x2)[_0xcd91[1]](_0xcd91[0]),_0xfc06x4=$(wishlistButtonClass+ _0xcd91[2]+ _0xfc06x3+ _0xcd91[3]);var _0xfc06x5=$[_0xcd91[4]](_0xfc06x3,wishlistObject)!==  -1?true:false;if(_0xfc06x5){window[_0xcd91[6]][_0xcd91[5]]= wishlistPageUrl}else {wishlistObject[_0xcd91[7]](_0xfc06x3);_0xfc06x4[_0xcd91[14]](_0xcd91[13])[_0xcd91[12]](_0xcd91[11])[_0xcd91[10]](theme[_0xcd91[9]][_0xcd91[8]]);_0xfc06x4[_0xcd91[17]](_0xcd91[15],theme[_0xcd91[9]][_0xcd91[16]])};localStorage[_0xcd91[20]](_0xcd91[18],JSON[_0xcd91[19]](wishlistObject));loadSmallWishList();$wishlistCount[_0xcd91[22]](wishlistObject[_0xcd91[21]])}
				var _0xd3ea=["\x63\x6C\x69\x63\x6B","\x70\x72\x65\x76\x65\x6E\x74\x44\x65\x66\x61\x75\x6C\x74","\x6F\x6E","\x68\x61\x6E\x64\x6C\x65","\x64\x61\x74\x61","\x5B\x64\x61\x74\x61\x2D\x68\x61\x6E\x64\x6C\x65\x3D\x22","\x22\x5D","\x77\x69\x73\x68\x6C\x69\x73\x74\x49\x63\x6F\x6E","\x73\x74\x72\x69\x6E\x67\x73","\x68\x74\x6D\x6C","\x74\x69\x74\x6C\x65","\x77\x69\x73\x68\x6C\x69\x73\x74\x54\x65\x78\x74","\x61\x74\x74\x72","\x69\x6E\x64\x65\x78\x4F\x66","\x73\x70\x6C\x69\x63\x65","\x6C\x6F\x63\x61\x6C\x57\x69\x73\x68\x6C\x69\x73\x74","\x73\x74\x72\x69\x6E\x67\x69\x66\x79","\x73\x65\x74\x49\x74\x65\x6D","\x66\x61\x64\x65\x4F\x75\x74","\x2E\x6A\x73\x2D\x77\x69\x73\x68\x6C\x69\x73\x74\x2D\x69\x74\x65\x6D","\x63\x6C\x6F\x73\x65\x73\x74","\x6C\x65\x6E\x67\x74\x68","\x74\x65\x78\x74"];$(document)[_0xd3ea[2]](_0xd3ea[0],wishlistButtonClass,function(_0xdfa5x1){_0xdfa5x1[_0xd3ea[1]]();updateWishlist(this)});$(document)[_0xd3ea[2]](_0xd3ea[0],wishlistRemoveButtonClass,function(){var _0xdfa5x2=$(this)[_0xd3ea[4]](_0xd3ea[3]),_0xdfa5x3=$(wishlistButtonClass+ _0xd3ea[5]+ _0xdfa5x2+ _0xd3ea[6]);_0xdfa5x3[_0xd3ea[9]](theme[_0xd3ea[8]][_0xd3ea[7]]);_0xdfa5x3[_0xd3ea[12]](_0xd3ea[10],theme[_0xd3ea[8]][_0xd3ea[11]]);wishlistObject[_0xd3ea[14]](wishlistObject[_0xd3ea[13]](_0xdfa5x2),1);localStorage[_0xd3ea[17]](_0xd3ea[15],JSON[_0xd3ea[16]](wishlistObject));$(this)[_0xd3ea[20]](_0xd3ea[19])[_0xd3ea[18]]();$wishlistCount[_0xd3ea[22]](wishlistObject[_0xd3ea[21]]);if(wishlistObject[_0xd3ea[21]]=== 0){loadNoResult()}});loadWishlist();loadSmallWishList();return {load:loadWishlist}
			})()
			theme.strings = {
				wishlistNoResult: "<p>Chưa có sản phẩm yêu thích! Hãy lựa chọn những sản phẩm ưa thích của mình nào.</p>",
				wishlistIcon: "<img  alt='Thêm vào yêu thích' width='25' height='25' src='https://bizweb.dktcdn.net/100/423/358/themes/852010/assets/heart.png?1645678264903'/>",
				wishlistIconAdded: "<img class='fash-added'  alt='Đến trang sản phẩm yêu thích' width='25' height='25' src='https://bizweb.dktcdn.net/100/451/884/themes/857425/assets/heartadd.png?1649958365417'/>",
				wishlistText: "Thêm vào yêu thích",
				wishlistTextAdded: "Đến trang sản phẩm yêu thích",
				wishlistRemove: "Xóa"
			};
			if ($(window).width() <= 992) {
				$('.sub-info-item').remove();
			}
			if(window.BPR)
				return window.BPR.initDomEls(), window.BPR.loadBadges();
			if(window.ABProdStats){
				window.ABProdStats.abInitProductStats()
			}
		}
	});		
}

function sortby(sort) {			 
	switch(sort) {
		case "price-asc":
			selectedSortby = "price_min:asc";					   
			break;
		case "price-desc":
			selectedSortby = "price_min:desc";
			break;
		case "alpha-asc":
			selectedSortby = "name:asc";
			break;
		case "alpha-desc":
			selectedSortby = "name:desc";
			break;
		case "created-desc":
			selectedSortby = "created_on:desc";
			break;
		case "created-asc":
			selectedSortby = "created_on:asc";
			break;
		default:
			selectedSortby = "";
			break;
	}

	doSearch(1);
}

function resortby(sort){
	$('.sort-cate-right .btn-quick-sort').removeClass('active');
	switch(sort){				  
		case "price_min:asc":
			tt = "Giá tăng dần";
			$('.sort-cate-right .price-asc').addClass("active");
			break;
		case "price_min:desc":
			tt = "Giá giảm dần";
			$('.sort-cate-right .price-desc').addClass("active");
			break;
		case "name:asc":
			tt = "Tên A → Z";
			$('.sort-cate-right .alpha-asc').addClass("active");
			break;
		case "name:desc":
			tt = "Tên Z → A";
			$('.sort-cate-right .alpha-desc').addClass("active");
			break;
		case "created_on:desc":
			tt = "Hàng mới nhất";
			$('.sort-cate-right .position-desc').addClass("active");
			break;
		case "created_on:asc":
			tt = "Hàng cũ nhất";
			break;
		default:
			tt = "Mặc định";
			$('.sort-cate-right .default').addClass("active");
			break;
	}			   
	$('#sort-by > ul > li > span').html(tt);
}


function _selectSortby(sort) {
	resortby(sort);
	switch(sort) {
		case "price-asc":
			selectedSortby = "price_min:asc";
			break;
		case "price-desc":
			selectedSortby = "price_min:desc";
			break;
		case "alpha-asc":
			selectedSortby = "name:asc";
			break;
		case "alpha-desc":
			selectedSortby = "name:desc";
			break;
		case "created-desc":
			selectedSortby = "created_on:desc";
			break;
		case "created-asc":
			selectedSortby = "created_on:asc";
			break;
		default:
			selectedSortby = sort;
			break;
	}
}

function toggleCheckbox(id) {
	$(id).click();
}

function pushCurrentFilterState(options) {
	resortby(selectedSortby);
	if(!options) options = {};
	var url = filter.buildSearchUrl(options);
	var queryString = url.slice(url.indexOf('?'));			  
	if(selectedViewData == 'data_list'){
		queryString = queryString + '&view=list';	
		$('.button-view-mode').removeClass('active');
		$('.button-view-mode.view-mode-list').addClass('active');
	}
	else{
		queryString = queryString + '&view=grid';	
		$('.button-view-mode').removeClass('active');
		$('.button-view-mode.view-mode-grid').addClass('active');
	}

	pushState(queryString);
}

function pushState(url) {
	window.history.pushState({
		turbolinks: true,
		url: url
	}, null, url)
}
function switchView(view) {			  
	switch(view) {
		case "list":
			$('.button-view-mode').removeClass('active');
			$('.button-view-mode.view-mode-list').addClass('active');
			selectedViewData = "data_list";					   
			break;
		default:
			$('.button-view-mode').removeClass('active');
			$('.button-view-mode.view-mode-grid').addClass('active');
			selectedViewData = "data";
			break;
	}			   
	var url = window.location.href;
	var page = getParameter(url, "page");
	if(page != '' && page != null){
		doSearch(page);
	}else{
		doSearch(1);
	}
}

function selectFilterByCurrentQuery() {
	var isFilter = false;
	var url = window.location.href;
	var queryString = decodeURI(window.location.search);
	var filters = queryString.match(/\(.*?\)/g);
	var page = 0;

	if(queryString) {
		isFilter = true;
		$.urlParam = function(name){
			var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
			return results[1] || 0;
		}
		page = $.urlParam('page');
	}
	if(filters && filters.length > 0) {
		filters.forEach(function(item) {
			item = item.replace(/\(\(/g, "(");
			var element = $(".aside-content input[value='" + item + "']");
			element.attr("checked", "checked");
			_toggleFilter(element);
		});

		isFilter = true;
	}

	var sortOrder = getParameter(url, "sortby");
	if(sortOrder) {
		_selectSortby(sortOrder);
	}

	if(isFilter) {
		doSearch(page);
		renderFilterdItems();
	}
}


var maxx = 100000000/10;
var slider = $('#slider');
if (slider ){
	slider.slider({
		min: '0',
		max: maxx,
		range: true,
		values: [0,100000000],
		slide: function(event, ui) {
			if(ui.values[0] >= ui.values[1]) {
				if(ui.handle == $("#slider a")[0]) {
					$("#slider").slider("values", 1, ui.value);
					ui.values[0] = ui.value;
					ui.values[1] = ui.value;
				} else {
					$("#slider").slider("values", 0, ui.value);
					ui.values[0] = ui.value;
					ui.values[1] = ui.value;
				}
			}			

			var uimax =ui.values[1]+1;	
				
			if(ui.values[0] > 0){
				var v1 = Bizweb.formatMoney(ui.values[0], "{{amount_no_decimals_with_comma_separator}}₫");
											}else{
											var v1 = ui.values[0];
											}
											var v2 = Bizweb.formatMoney((ui.values[1]+1), "{{amount_no_decimals_with_comma_separator}}₫");

				

				$('#start input').val(v1);
				$('#stop input').val(v2);
				var uimin =ui.values[0]-1;
				var uimax =ui.values[1]+2;
				$('#filter-value').attr('data-value','(>'+uimin+' AND <'+uimax+')');
			}
		});
		$(document).on('change','#start',function(e){
		var val = parseInt($('#start input').val())-1;
		var val2 = parseInt($('#stop input').val())+1;

		$("#slider").slider("values",0,parseInt(val));
		$('#filter-value').attr('data-value','(>'+val+' AND <'+val2+')');
	});
	$(document).on('change','#stop',function(e){
		var val = parseInt($('#start input').val())-1;
		var val2 = parseInt($('#stop input').val())+1;

		$("#slider").slider("values",1,parseInt(val2));
		$('#filter-value').attr('data-value','(>'+val+' AND <'+val2+')');
	});
}
function getParameter(url, name) {
	name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
		results = regex.exec(url);
	return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

$( document ).ready(function() {
	selectFilterByCurrentQuery();
	$('.filter-group .filter-group-title').click(function(e){
		$(this).parent().toggleClass('active');
	});

	$('.filter-mobile').click(function(e){
		$('.aside.aside-mini-products-list.filter').toggleClass('active');
	});

	$('#show-admin-bar').click(function(e){
		$('.aside.aside-mini-products-list.filter').toggleClass('active');
	});

	$('.filter-container__selected-filter-header-title').click(function(e){
		$('.aside.aside-mini-products-list.filter').toggleClass('active');
	});
});
$('.filter-item--check-box input').change(function(e){
	var $this = $(this);
	toggleFilter($this);
})
$('a#filter-value').click(function(e){
	var $this = $(this);
	_toggleFilterdqdt($this);
})
$('.dosearch').click(function(e){
	var $data = $(this).attr('data-onclick');
	doSearch($data);
})
$('.awe_sortby').on('click',function(e){
	var $data = $(this).attr('data-onclick');
	sortby($data);

})
function filterItemInList(object) {
	q = object.val().toLowerCase();
	object.parent().next().find('li').show();
	if (q.length > 0) {
		object.parent().next().find('li').each(function() {
			if ($(this).find('label').attr("for").indexOf(q) == -1)
				$(this).hide();
		})
	}
}

/*Sắp xếp trang collection*/
$('#sort-by .ul_col li span').click(function(e){

	$('.content_ul').css('display', 'block');
	e.preventDefault();

});
$('#sort-by .ul_col .content_ul li').click(function(e){

	$(".content_ul").css('display', 'none');
	e.preventDefault();

});

$(document).ready(function($){
	$('.sort-cate .btn-filter').click(function(){
		$(".layout-collection .left-content").toggleClass('active');
		$(".backdrop__body-backdrop___1rvky").toggleClass('active');
	});
	$('.backdrop__body-backdrop___1rvky').click(function(){
		$(".layout-collection .left-content").removeClass('active');
		$(this).toggleClass('active');
	});
	$('.close-filters').click(function(){
		$(".layout-collection .left-content").removeClass('active');
		$('.backdrop__body-backdrop___1rvky').removeClass('active');
	});
	$('.aside-filter .aside-hidden-mobile .aside-item .aside-title').on('click', function(e){
		e.preventDefault();
		var $this = $(this);
		$this.parents('.aside-filter .aside-hidden-mobile .aside-item').find('.aside-content').stop().slideToggle();
		$(this).toggleClass('active')
		return false;
	});
	if($(window).width() <= 991) {
		$('.sort-cate-right h3').on('click', function(e){
			e.preventDefault();var $this = $(this);
			$this.parents('.sort-cate-right').find('ul').stop().slideToggle();
			$(this).toggleClass('active');
			return false;
		});	
	}
});
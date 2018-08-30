(function($) {
  "use strict"; // Start of use strict

  // Smooth scrolling using jQuery easing
  $('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function() {
    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      if (target.length) {
        $('html, body').animate({
          scrollTop: (target.offset().top - 70)
        }, 1000, "easeInOutExpo");
        return false;
      }
    }
  });

  // Scroll to top button appear
  $(document).scroll(function() {
    var scrollDistance = $(this).scrollTop();
    if (scrollDistance > 100) {
      $('.scroll-to-top').fadeIn();
    } else {
      $('.scroll-to-top').fadeOut();
    }
  });

  // Closes responsive menu when a scroll trigger link is clicked
  $('.js-scroll-trigger').click(function() {
    $('.navbar-collapse').collapse('hide');
  });

  // Activate scrollspy to add active class to navbar items on scroll
  $('body').scrollspy({
    target: '#mainNav',
    offset: 80
  });

  // Collapse Navbar
  var navbarCollapse = function() {
    if ($("#mainNav").offset().top > 100) {
      $("#mainNav").addClass("navbar-shrink");
    } else {
      $("#mainNav").removeClass("navbar-shrink");
    }
  };
  // Collapse now if page is not at top
  navbarCollapse();
  // Collapse the navbar when page is scrolled
  $(window).scroll(navbarCollapse);

  // Modal popup$(function () {
  $('.portfolio-item').magnificPopup({
    type: 'inline',
    preloader: false,
    focus: '#username',
    modal: true
  });
  $(document).on('click', '.portfolio-modal-dismiss', function(e) {
    e.preventDefault();
    $.magnificPopup.close();
  });

  // Floating label headings for the contact form
  $(function() {
    $("body").on("input propertychange", ".floating-label-form-group", function(e) {
      $(this).toggleClass("floating-label-form-group-with-value", !!$(e.target).val());
    }).on("focus", ".floating-label-form-group", function() {
      $(this).addClass("floating-label-form-group-with-focus");
    }).on("blur", ".floating-label-form-group", function() {
      $(this).removeClass("floating-label-form-group-with-focus");
    });
  });

  // Diet planner logic
	$('div#diet-selector a.diet-item').unbind('click').on('click', function(e) {
		e.preventDefault();
		const dietId = $(this).data('id');
		const dataURL = 'diets/diet' + dietId + '.json';
		$.getJSON(dataURL, function(data) {
			initMeals(data);
			
			$('button#submit-food-plan').unbind('click').on('click', function() {
				submitFoodPlan(data);
			});
		});
	});

	function initMeals(meals) {
		$('div#meal-selector div.tab-content div.tab-pane').each(function() {
			const tabElement = $(this);
			const day = tabElement.attr('id');
			const mealList = generateMealList(day, meals);
			$('div#meal-selector div.tab-content div.tab-pane[id=' + day + ']').html('').append(mealList);
		});
		$('div#meal-selector').show();
		$('div.meal-list-wrapper').show();
    }
	
	function generateMealList(day, meals) {
		const mealList = $('div#meal-list-skel').clone().removeAttr('id').show();
		const partsOfDay = ["breakfast", "lunch", "dinner"];
		$.each(partsOfDay, function(key, partOfDay) {
			const partOfDayMeals = meals[partOfDay];
			const mealItems = generateMealItems(day, partOfDay, partOfDayMeals);
			$('div.' + partOfDay + ' ul.list-group', mealList).html('').append(mealItems);
		});
		return mealList;
	}

	function generateMealItems(day, partOfDay, meals) {
		var items = [];
		const skel = $('div#meal-item-skel');

		$.each(meals, function(key, meal) {
			var item = skel.clone().removeAttr('id').show();
			const itemId = day + '-' + partOfDay + '-' + key;
			const itemName = day + '-' + partOfDay;
			const itemValue = key;

			$('input.form-check-input', item)
				.attr('name', itemName)
				.attr('id', itemId)
				.attr('value', itemValue);
			$('label.form-check-label', item)
				.attr('for', itemId)
				.html(meal.title);
			$('small', item)
				.html(meal.hour);
			$('p', item)
				.html(meal.description);

			items.push(item);
		});

	  return items;
	}
	
	function submitFoodPlan(data) {
		var generatedList = {}
		
		var daysOfWeek = [];
		$('div#meal-selector div.tab-content div.tab-pane').each(function() {
			daysOfWeek.push($(this).attr('id'));
		});
		var validationPassed = true;
		$.each(data, function(partOfDay, meals) {
			$.each(daysOfWeek, function(key, dayOfWeek) {
				const inputName = dayOfWeek + '-' + partOfDay;
				const inputValue = $('input[name=' + inputName + ']:checked').val();
				if (typeof(inputValue) == "undefined") {
					validationPassed = false;
					alert('Va rugam completati masa pentru ' + dayEnToRo(dayOfWeek) + ', ' + partOfDayEnToRo(partOfDay) + '.');
					return false;
				}
				else {
					if (!generatedList[dayOfWeek]) {
						generatedList[dayOfWeek] = {};
					}
					generatedList[dayOfWeek][partOfDay] = data[partOfDay][parseInt(inputValue)];
				}
			});
			if (!validationPassed) {
				return false;
			}
		});

		if (!validationPassed) {
			return false;
		}

		var resultsText = $('<div />');
		$.each(generatedList, function(dayOfWeek, dayData) {
			resultsText.append($('<h2 />').html(dayEnToRo(dayOfWeek)));
			$.each(dayData, function(partOfDay, meal) {
				resultsText.append($('<h3 />').html(partOfDayEnToRo(partOfDay)));
				resultsText.append($('<p />').html('<strong>Titlu:</strong> ' + meal.title));
				resultsText.append($('<p />').html('<strong>Hour:</strong> ' + meal.hour));
				resultsText.append($('<p />').html('<strong>Description:</strong> ' + meal.description));
			});
		});

		$('div#results-page div.content').html('').append(resultsText);
		$.magnificPopup.open({
			items: {
				src: 'div#results-page'
			}
		});
		
		$(document).on('click', '.diet-modal-dismiss', function(e) {
			e.preventDefault();
			$.magnificPopup.close();
		});
	}
	
	function dayEnToRo(enDay) {
		switch(enDay) {
			case 'monday':
				return 'luni';
				break;
			case 'tuesday':
				return 'marti';
				break;
			case 'wednesday':
				return 'miercuri';
				break;
			case 'thursday':
				return 'joi';
				break;
			case 'friday':
				return 'vineri';
				break;
			default:
				return '';
				break;
		}
	}
	
	function partOfDayEnToRo(enPartOfDay) {
		switch(enPartOfDay) {
			case 'breakfast':
				return 'mic dejun';
				break;
			case 'lunch':
				return 'pranz';
				break;
			case 'dinner':
				return 'cina';
				break;
			default:
				return '';
				break;
		}
	}

	function toObject(arr) {
		var rv = {};
		for (var i = 0; i < arr.length; ++i)
			rv[i] = arr[i];
		return rv;
	}
	
})(jQuery); // End of use strict

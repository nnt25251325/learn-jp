;
(function($) {
	var url_data = 'json/data.json',
			game_type = 0,
			letter_type = 0,
			array_latin = [],
			latin = '',
			count,
			time = 0,
			duration = 0,
			time_to_show = 0,
			current_duration = 0,
			is_paused = true,
			count_initialized = false,
			is_show_result = false;

	var myApp = {
		// lấy giá trị loại game từ ô input
		getGameType: function() {
			if ($('.item_game_type:checked').length == 0) { // ko thằng nào được check
				game_type = 0;
				$('.item_game_type').each(function() {
					$(this).val() == 0 ? $(this).prop('checked', true) : '';
				});
			} else {
				$('.item_game_type').each(function() {
					$(this).is(':checked') ? game_type = parseInt($(this).val()) : '';
				});
			}
		},

		//  lấy giá trị loại chữ cái từ input
		getLetterType: function() {
			if ($('.item_letter_type:checked').length == 0) {
				letter_type = 0;
				$('.item_letter_type').each(function() {
					$(this).val() == 0 ? $(this).prop('checked', true) : '';
				});
			} else {
				$('.item_letter_type').each(function() {
					$(this).is(':checked') ? letter_type = parseInt($(this).val()) : '';
				});
			}
		},

		// lấy dữ liệu từ json
		getData: function() {
			var wrp = $('.group_wrp');
			var group_num = 0;
			var row_num = 0;
			$.ajax({
				method: 'GET',
				url: url_data,
				dataType: 'json',
				cache: false,
				async : false,
				success: function(data) {
					// console.log(data);
					wrp.empty().hide().stop().fadeIn();
					var letter = data.letter[letter_type];

					// Trong CSDL, data.letter[0] là bảng hiragana, còn data.letter[1] là bảng Katagana
					// console.log(data.letter[0].list_group[0].group_content[0][0].latin);
					// Lặp và in 4 nhóm chữ cái trong 1 bảng
					for (var i = 0; i < letter.list_group.length; i++) {
						group_num = i;
						var group_name = letter.list_group[group_num].group_name;
						var group_content = letter.list_group[group_num].group_content;
						wrp.append(
							'<div class="group group_'+ group_num +' check_wrp">'+
								'<h5>'+
									'<span class="title_group">'+ group_name +'</span>'+
									'<button class="btn_check">Check</button>'+
									'<button class="btn_uncheck">Uncheck</button>'+
								'</h5>'+
								'<ul class="group_checkbox">'+
								'</ul>'+
							'</div>'
						);

						// Lặp và in ra từng hàng trong 1 nhóm (lặp qua 9 arrays, hay 9 hàng, ví dụ mỗi thể có  hàng có 5 chữ a i u e o)
						for (var j = 0; j < group_content.length; j++) {
							row_num = j;
							var group_checkbox = wrp.find('.group_checkbox').eq(group_num);
							var row_array = group_content[row_num];
							group_checkbox.append(
								'<li class="check_wrp row_'+ row_num +'">' +
									'<ul class="checkboxs"></ul>'+
									'<div class="btn_wrp">'+
										'<button class="btn_check">Check</button>' +
										'<button class="btn_uncheck">Uncheck</button>' +
									'</div>'+
								'</li>'
							);

							// mỗi array là 1 hàng gồm có các object (mỗi object chứa latin và jp)
							for (var k = 0; k < row_array.length; k++) {
								var char_lt = row_array[k].latin;
								var char_jp = row_array[k].jp;
								var checkboxs = group_checkbox.find('.checkboxs').eq(row_num);

								// In các checkbox cùng giá trị ra màng hình
								if (game_type == 0) {
									checkboxs.append(
										'<li>' +
											'<input type="checkbox" checked value="'+ char_lt +'">' +
											'<span class="label"><span class="text">'+ char_lt +'</span></span>' +
										'</li>'
									);
								} else {
									checkboxs.append(
										'<li>' +
											'<input type="checkbox" checked value="'+ char_lt +'">' +
											'<span class="label"><span class="text">'+ char_jp +'</span></span>' +
										'</li>'
									);
								}
							};
						}
					};

					// lấy và in giá trị của duration và time_to_show vào input tương ứng
					time = duration = data.set_time.duration;
					$('#duration').val(duration);

					time_to_show = data.set_time.time_to_show;
					$('#time_to_show').val(time_to_show);

					// Các hàm được chạy khi ajax thực thi xong
					myApp.getArrayLatin();
					myApp.getRandomLatin(array_latin); // mảng array_latin đã được tạo từ hàm getArrayLatin() bên trên
					myApp.printLetter(latin);
					myApp.printTimeCount(duration);
					myApp.printTimeInfo();
					myApp.printResult();
				}
			});
		},

		// Lấy hết kí tự latin vào mảng array_latin.
		getArrayLatin: function() {
			$.ajax({
				method: 'GET',
				url: url_data,
				dataType: 'json',
				cache: false,
				async : false,
				success: function(data) {
					var letter = data.letter[0]; // Đây là bảng Hiragana, chỉ cần bảng này là có thể lấy hết kí tự latin.
					for (var i = 0; i < letter.list_group.length; i++) {
						var group_content = letter.list_group[i].group_content;
						for (var j = 0; j < group_content.length; j++) {
							var row_array = group_content[j];
							for (var k = 0; k < row_array.length; k++) {
								var char_latin = row_array[k].latin;
								array_latin.push(char_latin);
							};
						}
					};
				}
			});
		},

		convertToJp: function(para_latin) {
			var jp = '';
			$.ajax({
				method: 'GET',
				url: url_data,
				dataType: 'json',
				cache: false,
				async : false,
				success: function(data) {
					var letter = data.letter[letter_type];
					for (var i = 0; i < letter.list_group.length; i++) {
						var group_content = letter.list_group[i].group_content;
						for (var j = 0; j < group_content.length; j++) {
							var row_array = group_content[j];
							for (var k = 0; k < row_array.length; k++) {
								if (para_latin == row_array[k].latin) {
									jp = row_array[k].jp;
									return false;
								}
							}
						}
					}
				}
			});
			return jp;
		},

		// Lấy ngẫu nhiên chữ cái latin
		getRandomLatin: function(para_array_latin) {
			var key_rand = Math.floor(Math.random() * para_array_latin.length);
			latin = para_array_latin[key_rand];
		},

		// Hiển thị value ra màn hình, chạy mp3 ứng với value đó
		printLetter: function(para_latin) {
			$('h1.letter .small').html('');
			if (game_type == 0) {
				$('h1.letter .big').html(para_latin);
			} else {
				$('h1.letter .big').html(myApp.convertToJp(para_latin));
			}
			$('#player')[0].setAttribute('src', 'audio/' + para_latin + '.mp3');
		},

		printTimeCount: function(time) {
			$('h3.time').html(time);
		},

		printTimeInfo: function() {
			$('.time_info .txt_duration').html(duration);
			$('.time_info .txt_to_show').html(time_to_show);
		},

		// Nhấn vào nút radio để chọn game_type, gán giá trị đã lấy được vào biến game_type, sau đó chạy lại hàm getData để in lại dữ liệu
		changeGameType: function() {
			$('.item_game_type').on('change', function() {
				game_type = parseInt($(this).val());
				myApp.getData();
				myApp.resetCount();
				myApp.getRandomLatin(array_latin);
				myApp.printLetter(latin);
				myApp.printResult();
			});
		},

		// Tương tự changeGameType
		changeLetterType: function() {
			$('.item_letter_type').on('change', function() {
				letter_type = parseInt($(this).val());
				myApp.getData();
				myApp.resetCount();
				myApp.getRandomLatin(array_latin);
				myApp.printLetter(latin);
				myApp.printResult();
			});
		},

		play: function() {
			is_paused = false;
			$('#player')[0].play();
			$('#play').html('PAUSE');
			myApp.checkInitCount(); // nếu hàm play() được gọi đến, thì đồng thời cũng kiểm tra luôn xem hàm initCount() đã chạy lần này chưa, chưa thì cho chạy 1 lần duy nhất.
		},

		pause: function() {
			is_paused = true;
			$('#player')[0].pause();
			$('#play').html('PLAY');
		},

		togglePlay: function() {
			is_paused ? myApp.play() : myApp.pause();
		},

		showResult: function() { // Kiểm tra xem đang ở loại trò chơi nào (Nếu đang là kí tự latin thì đổi sang kí tự japan tương ứng và ngược lại)
			game_type == 0 ? $('h1.letter .small').html(myApp.convertToJp(latin)) : $('h1.letter .small').html(latin);
		},

		showResultRevert: function(elm) {
			game_type == 0 ? elm.closest('.label').find('.txt_revert').html(myApp.convertToJp(latin)) : elm.closest('.label').find('.txt_revert').html(latin);
		},

		printResult: function() {
			if ((duration <= time_to_show || time <= time_to_show)) {
				myApp.showResult();
			} else {
				$('h1.letter .small').html('');
			}
			if(is_show_result) {
				myApp.showResult();
			}
		},

		checkInitCount: function() { // kiểm tra xem hàm đếm đã được chạy chưa, chỉ cho initCount chạy 1 lần, nếu đã chạy thì chuyển biến khởi tạo thành true (count_initialized = true)
			if(count_initialized == false) {
				count_initialized = true;
				myApp.initCount();
			}
		},

		initCount: function() { // khởi tạo hàm đếm ngược
			count = setInterval(function() {
				if(!is_paused) {
					time = time - 1;
					if(time <= 0) {
						time = duration;
						myApp.getRandomLatin(array_latin);
						myApp.printLetter(latin);
						myApp.play();
						is_show_result = false;
						$('.checkboxs .label .revert').remove();
					}
					myApp.printTimeCount(time);
					myApp.printResult();
				}
			}, 1000);
		},

		resetCount: function() {
			clearInterval(count); // Xóa hàm đếm count.
			count_initialized = false; // Cho biến khởi tạo đếm về như ban đầu (ban đầu = false).
			time = duration; // lấy lại biến time về giá trị ban đầu.
			myApp.printTimeCount(time); // In giá trị của biến time ra màn hình.
			$('h1.letter .small').html(''); // Xóa kết quả đã hiển thị.
			myApp.pause(); // Dừng player
			is_show_result = false; // Cho biến kiểm tra hiện kết quả về như ban đầu (ban đầu = false).
		},

		// Kiểm tra giá trị của duration và time_to_show do người dùng nhập vào từ 2 input #duration, #time_to_show có phù hợp không
		// Nếu duration = 12 giây, và time_to_show = 8 giây, thì đề bài sẽ hiện trong 12 giây trước khi nhảy sang đề bài mới. Đến giây thứ 8 (time_to_show = 8) thì sẽ hiện kết quả
		checkSetTime: function() {
			duration = parseInt($('#duration').val());
			time_to_show = parseInt($('#time_to_show').val());

			if (duration <= 0  || isNaN(duration)) {
				duration = 10;
				$('#duration').val(duration);
			}

			if (time_to_show < 0 || isNaN(time_to_show)) {
				time_to_show = 3;
				$('#time_to_show').val(time_to_show);
			}

			if (time_to_show > duration) {
				time_to_show = duration;
				$('#time_to_show').val(time_to_show);
			}

			myApp.printTimeInfo();
		},

		getArrayLatin2: function() { // tạo mảng array_latin mới, lấy từ dữ liệu của các ô input checkbox
			array_latin = [];
			$('.checkboxs input[type="checkbox"]:checked').each(function() {
				array_latin.push($(this).val());
			});
		},

		scrollToElement: function(element, durationScroll) {
			$('html, body').animate({
				scrollTop: element.offset().top
			}, {
				queue: false,
				duration: durationScroll
			});
		}
	};

	$(document).on('ready', function() {
		myApp.getGameType();
		myApp.getLetterType();
		myApp.getData();

		myApp.changeGameType();
		myApp.changeLetterType();

		$('#restart').on('click', function() {
			$('#player')[0].currentTime = 0;
			$('#player')[0].play();
		});

		$('#play').on('click', function() {
			myApp.togglePlay();
		});

		$('#show_result').on('click', function() {
			is_show_result = true;
			myApp.showResult();
		});

		$('#set_duration, #set_time_to_show').on('click', function() {
			myApp.checkSetTime();
			myApp.printResult();
		});

		$('#next').on('click', function() {
			myApp.resetCount();
			myApp.getRandomLatin(array_latin);
			myApp.printLetter(latin);
			myApp.printResult();
			myApp.play();
			$('.checkboxs .label .revert').remove();
		});

		$(window).on('keydown', function(event) {
			// Space
			if (event.keyCode == 32) {
				myApp.togglePlay();
				return false;
			}

			// Right Arrow
			if (event.keyCode == 39) {
				myApp.resetCount();
				myApp.getRandomLatin(array_latin);
				myApp.printLetter(latin);
				myApp.printResult();
				myApp.play();
				return false;
			}

			// Enter
			if (event.keyCode == 13) {
				is_show_result = true;
				myApp.showResult();
				return false;
			}

			// R
			if (event.keyCode == 82) {
				$('#player')[0].currentTime = 0;
				$('#player')[0].play();
				return false;
			}
		});

		$('#duration, #time_to_show').on('focus', function() {
			$(window).on('keydown', function(event) {
				// Enter
				if (event.keyCode == 13) {
					myApp.checkSetTime();
					myApp.printResult();
				}
			});
		});

		// Checkbox
		$(document.body).on('click', '.btn_check', function() {
			$(this).closest('.check_wrp').find('input[type="checkbox"]').prop('checked', true);
		});

		$(document.body).on('click', '.btn_uncheck', function() {
			$(this).closest('.check_wrp').find('input[type="checkbox"]').prop('checked', false);
		});

		$('#setLetter').on('click', function() {
			myApp.getArrayLatin2();
			if (array_latin.length == 0) {
				$('.error_check').html('Please check! Then press OK!');
				myApp.pause();
			} else {
				$('.error_check').html('');
				myApp.resetCount();
				myApp.getRandomLatin(array_latin); // mảng array_latin mới đã được tạo từ hàm getArrayLatin2()
				myApp.printLetter(latin);
				myApp.printResult();
				myApp.scrollToElement($('h1.letter'), 800);
			}
		});

		$(document.body).on('click', '.checkboxs .label .text', function() {
			latin = $(this).closest('.label').siblings('input[type="checkbox"]').val();
			$('.checkboxs .label .revert').remove();
			$(this).closest('.label').append('<span class="revert"><i class="txt_revert">Empty</i><i class="close">x</i></span>');
			myApp.resetCount();
			myApp.printLetter(latin);
			myApp.printResult();
			myApp.showResultRevert($(this));
			myApp.play();
		});

		$(document.body).on('click', '.checkboxs .label .close', function() {
			$(this).closest('.revert').remove();
		});
	});
})(jQuery);

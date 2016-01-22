require('jquery');
const $ = window.jQuery;

const i18n = require('../i18n');
const calendar = require('../calendar');

class TopBar {
	constructor($container, lang, autoClose, singleDate, intervalLimits, customMarkup, dateSeparator, dateFormat, customCloseBtnClass, onClose) {
		this.$container = $container;
		this.format = dateFormat;
		const html = this.createHtml(lang, autoClose, singleDate, customMarkup, dateSeparator, customCloseBtnClass, intervalLimits);
		this.$element = $(html);
		$container.prepend(this.$element);

		this.onClose = onClose;
		this.registerListeners();
	}

	createHtml(lang, autoClose, singleDate, customMarkup, dateSeparator, customCloseBtnClass, intervalLimits) {
		let html = '<div class="drp_top-bar">';

		if (customMarkup) {
			if (typeof customMarkup == 'function') {
				customMarkup = customMarkup();
			}
			html += '<div class="custom-top">' + customMarkup + '</div>';
		} else {
			let defaultTopText = '';
			if (singleDate) {
				defaultTopText = i18n.lang('default-single', lang);
			} else if (intervalLimits.minDays && intervalLimits.maxDays) {
				defaultTopText = i18n.lang('default-range', lang).replace(/\%d/, intervalLimits.minDays).replace(/\%d/, intervalLimits.maxDays);
			} else if (intervalLimits.minDays) {
				defaultTopText = i18n.lang('default-more', lang).replace(/\%d/, intervalLimits.minDays);
			} else if (intervalLimits.maxDays) {
				defaultTopText = i18n.lang('default-less', lang).replace(/\%d/, intervalLimits.maxDays);
			} else {
				defaultTopText = i18n.lang('default-default', lang);
			}
			
			html += `<div class="normal-top">
					<span style="color:#333">
						${i18n.lang('selected', lang)}
					</span><b class="start-day">...</b>`;
			if (!singleDate) {
				html += `<span class="separator-day">
					${dateSeparator}
				</span>
				<b class="end-day">...</b>
				<i class="selected-days">
					(<span class="selected-days-num">3</span>${i18n.lang('days', lang)})
				</i>`;
			}
			html += '</div>';
			html += `<div class="error-top">error</div>
				<div class="default-top">${defaultTopText}</div>`;
		}

		html += '<input type="button" ' +
					'class="' + this.getApplyBtnClass(autoClose, customCloseBtnClass) + '" ' +
					'value="' + i18n.lang('apply', lang) + '"' +
				'/>';
		html += '</div>';
		return html;
	}

	getApplyBtnClass(autoClose, extraClass) {
		var klass = 'apply-btn disabled';
		if (autoClose === true) {
			klass += ' hide';
		}
		if (extraClass !== '') {
			klass += ' ' + extraClass;
		}
		return klass;
	}

	enableCloseBtn() {
		this.$element.find('.apply-btn').removeClass('disabled');
	}
	disableCloseBtn() {
		this.$element.find('.apply-btn').addClass('disabled');
	}
	hideCloseBtn() {
		this.$element.find('.apply-btn').hide();
	}

	registerListeners() {
		this.$element.find('.apply-btn').click(this.onClose);
	}

	setState(evt) {
		const startText = evt.date1 ? calendar.getDateString(evt.date1, this.format) : '...';
		const endText = evt.date2 ? calendar.getDateString(evt.date2, this.format) : '...';
		const selectedText = evt.length || '';
		
		this.$element.find('.start-day').html(startText);
		this.$element.find('.end-day').html(endText);
		if (selectedText !== '') {
			this.$element.find('.selected-days').show().find('.selected-days-num').html(selectedText);
		} else {
			this.$element.find('.selected-days').hide();
		}
		if (evt.valid) {
			this.enableCloseBtn();
		} else {
			this.disableCloseBtn();
		}
	}
	
	static addToPicker(picker) {
		const opt = picker.getOptions();
		if (!opt.topBar.enabled) {
			return;
		}
		const topbar = new TopBar(
			picker.getDom(), opt.language, opt.autoclose, opt.singleDate, 
			opt, opt.topBar.customText, opt.separator, opt.format, opt.topBar.applyBtnClass,
			() => {
				picker.closeDatePicker();
				var dateRange = (
					calendar.getDateString(new Date(opt.start), opt.format) +
					opt.separator +
					calendar.getDateString(new Date(opt.end), opt.format)
				);
				picker.getEventEmitter().trigger('datepicker-apply', {
					'value': dateRange,
					'date1': new Date(opt.start),
					'date2': new Date(opt.end)
				});
			}
		);
		if (opt.alwaysOpen) {
			topbar.hideCloseBtn();
		}
		picker.getEventEmitter().on('datepicker-change-incomplete', data => {
			topbar.setState(data);
		});
		picker.getEventEmitter().on('datepicker-change', data => {
			topbar.setState(data);
		});
		picker.getEventEmitter().on('datepicker-update-validity', 
			valid => {
				if (valid) {
					topbar.enableCloseBtn();
				} else {
					topbar.disableCloseBtn();
				}
			}
		);
		return topbar;
	}
	
	static addOptionDefaults(opt) {
		opt.topBar = {
			enabled: true,
			customText: false,
			applyBtnClass: ''
		};
	}
}

module.exports = TopBar;
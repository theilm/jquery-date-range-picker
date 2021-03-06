require('jquery');
const $ = window.jQuery;

require('moment');
const moment = window.moment;

const utils = require('./utils');

class Gap {
	constructor(picker) {
		const $container = picker.getDom();
		this.$container = $container;
		this.$month1 = $container.find('.month1');
		this.$month2 = $container.find('.month2');
		const html = this.createHtml();
		this.$gap = $(html);
		this.$month1.after(this.$gap);
		this.applyHeight();
		
		picker.getEventEmitter().on('datepicker-change-month-view', () => {
			const opt = picker.getOptions();
			var m1 = parseInt(moment(opt.month1).format('YYYYMM'));
			var m2 = parseInt(moment(opt.month2).format('YYYYMM'));
			var p = Math.abs(m1 - m2);
			var shouldShow = (p > 1 && p !== 89); // 89 = same YYYY and MM differs by 11
			if (shouldShow) {
				this.show();
			} else {
				this.hide();
			}
		});
	}

	createHtml() {
		const html = [];
		if (!utils.supportsGradients()) {
			html.push('<div class="gap-top-mask"></div><div class="gap-bottom-mask"></div><div class="gap-lines">');

			for (let i = 0; i < 20; i++) {
				html.push(
					`<div class="gap-line">
						<div class="gap-1"></div>
						<div class="gap-2"></div>
						<div class="gap-3"></div>
					</div>`
				);
			}
			html.push('</div>');
		}
		return '<div class="gap">' + html.join('') + '</div>';
	}

	applyHeight() {
		var h1 = this.$month1.height();
		var h2 = this.$month2.height();

		// TODO having at least 30px as height is a workaround
		// When picker is opened, animations make months' heights = 0.
		// But is not enough for gap to be placed between month tables
		// Therefore, no gap is displayed initially.
		this.$gap.height(Math.max(Math.max(h1, h2) + 10, 30));
	}

	show() {
		this.applyHeight();
		this.$gap.css('visibility', 'visible');
		this.$container.addClass('has-gap').removeClass('no-gap');
	}

	hide() {
		this.$container.removeClass('has-gap').addClass('no-gap');
		this.$gap.css('visibility', 'hidden');
	}

	static addToPicker(picker) {
		return new Gap(picker);
	}
}

module.exports = Gap;

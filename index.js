
/* SHAPES */
class Rectangle {
	constructor(x, y, width, height, filled=true) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.filled = filled;
	}
	get_area() {
		if (!this.filled) {
			return - this.width * this.height;
		}
		return this.width * this.height;
	}
	get_xbar() {
		return this.x + this.width / 2;
	}
	get_ybar() {
		return this.y + this.height / 2;
	}
	get_moi() {
		return 1/12 * this.width * Math.pow(this.height,3); 
	}
}

class EquilateralTriangle {
	constructor(x, y, base, height, filled=true) {
		this.x = x;
		this.y = y;
		this.base = base;
		this.height = height;
		this.filled = filled;
	}
	get_area() {
		if (!this.filled) {
			return - 1/2 * this.base * this.height;
		}
		return 1/2 * this.base * this.height;
	}
	get_xbar() {
		return this.x + 1/2 * this.width;
	}
	get_ybar() {
		return this.y + 1/3 * this.height;
	}
	get_moi() {
		return 1/36 * this.base * Math.pow(this.height,3);
	}
}

class Circle {
	constructor(x, y, radius, filled=true) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.filled = filled;
	}
	get_area() {
		if (!this.filled) {
			return - Math.PI * Math.pow(this.radius,2);
		}
		return Math.PI * Math.pow(this.radius,2);
	}
	get_xbar() {
		return this.x + this.radius;
	}
	get_ybar() {
		return this.y + this.radius;
	}
	get_moi() {
		return Math.PI / 4 * Math.pow(this.radius, 4);
	}
}

/* BEAMS */
class Beam {
	constructor() {
		this.shapes = [];
	}
	get_area() {
		let area = 0;
		for (let shape of this.shapes) {
			area += shape.get_area();
		}
		return area;
	}
	get_ybar() {
		let area = 0;
		let sum = 0;
		for (let shape of this.shapes) {
			sum += shape.get_ybar() * shape.get_area();
			area += shape.get_area();
		}
		return sum / area;
	}
	get_xbar() {
		let area = 0;
		let sum = 0;
		for (let shape of this.shapes) {
			sum += shape.get_xbar() * shape.get_area();
			area += shape.get_area();
		}
		return sum / area;
	}
	get_moi() {
		let ybar = this.get_ybar();
		let sum = 0;
		for (let shape of this.shapes) {
			let dy = shape.get_ybar() - ybar;
			sum += shape.get_moi() + shape.get_area() * Math.pow(dy,2);
		}
		return sum;
	}
}

class RectangleBeam extends Beam {
	constructor(base, height) {
		super();
		this.shapes.push(new Rectangle(0, 0, base, height));
	}
}

class HollowRectangleBeam extends Beam {
	constructor(base, height, inner_base, inner_height) {
		super();
		let dx = (base - inner_base) / 2;
		let dy = (height - inner_height) / 2;
		this.shapes.push(new Rectangle(0, 0, base, height));
		this.shapes.push(new Rectangle(dx, dy, inner_base, inner_height, false));
	}
}

class TBeam extends Beam {
	constructor(upper_base, upper_height, lower_base, lower_height) {
		super();
		let dx = (upper_base - lower_base) / 2;
		this.shapes.push(new Rectangle(dx, 0, lower_base, lower_height));
		this.shapes.push(new Rectangle(0, lower_height, upper_base, upper_height));
	}
}

class IBeam extends Beam {
	constructor(upper_base, upper_height, middle_base, middle_height, lower_base, lower_height) {
		super();
		let max_x = Math.max(upper_base, lower_base);
		let min_x = Math.min(upper_base, lower_base);
		let diff_x = max_x - min_x;
		var upper_x, lower_x;
		if (upper_base > lower_base) {
			upper_x = diff_x / 2;
			lower_x = 0;
		} else {
			upper_x = 0;
			lower_x = diff_x / 2;
		}
		this.shapes.push(new Rectangle(lower_x, 0, lower_base, lower_height));
		this.shapes.push(new Rectangle((max_x - middle_base) / 2, lower_height, middle_base, middle_height));
		this.shapes.push(new Rectangle(upper_x, lower_height + middle_height, upper_height, upper_height));
	}
}

class HBeam extends Beam {
	constructor(left_base, left_height, middle_base, middle_height, right_base, right_height) {
		super();
		let max_y = Math.max(left_height, right_height);
		let min_y = Math.min(left_height, right_height);
		let diff_y = max_y - min_y;
		var left_y, right_y;
		if (left_height > right_height) {
			left_y = 0;
			right_y = diff_y / 2;
		} else {
			left_y = diff_y / 2;
			right_y = 0;
		}
		this.shapes.push(new Rectangle(0, left_y, left_base, left_height));
		this.shapes.push(new Rectangle(left_base, (max_y - middle_height) / 2, middle_base, middle_height));
		this.shapes.push(new Rectangle(left_base + middle_base, right_y, right_base, right_height));
	}
}

class CircleBeam extends Beam {
	constructor(radius) {
		super();
		this.shapes.push(new Circle(0, 0, radius));
	}
}

class HollowCircleBeam extends Beam {
	constructor(outer_radius, inner_radius) {
		super();
		let thickness = outer_radius - inner_radius;
		this.shapes.push(new Circle(0, 0, outer_radius));
		this.shapes.push(new Circle(thickness, thickness, inner_radius, false));
	}
}

class DoubleTBeam extends Beam {
	constructor(x1, y1, base1, height1, x2, y2, base2, height2, x3, y3, base3, height3) {
		alert("Error: Unsupported beam");
		return;
		super();
		this.shapes.push(new Rectangle(x1, y1, base1, height1));
		this.shapes.push(new Rectangle(x2, y2, base2, height2));
		this.shapes.push(new Rectangle(x3, y3, base3, height3));
	}
}

/* UI */
var current_beam_type;
var current_beam;
var variables = {};

let dropdown_labels = {
	"Rectangular Beam": "RectangleBeam",
	"Hollow Rectangular Beam": "HollowRectangleBeam",
	"T Beam": "TBeam",
	"I Beam": "IBeam",
	"H Beam": "HBeam",
	"Circular Beam": "CircleBeam",
	"Hollow Circular Beam": "HollowCircleBeam",
	"Double T Beam": "DoubleTBeam"
}

let labels = {
	"RectangleBeam" :{"base": "Base", "height": "Height"},
	"HollowRectangleBeam": {"base": "Base", "height": "Height",  "inner-base": "Inner Base", "inner-height": "Inner Height"},
	"TBeam": {"upper-base": "Upper Base", "upper-height": "Upper Height", "lower-base": "Lower Base", "lower-height": "Lower Height"},
	"IBeam": {"upper-base": "Upper Base", "upper-height": "Upper Height", "middle-base": "Middle Base", "middle-height": "Middle Height", "lower-base": "Lower Base", "lower-height": "Lower Height"},
	"HBeam": {"left-base": "Left Base", "left-height": "Left Height", "middle-base": "Middle Base", "middle-height": "Middle Height", "right-base": "Right Base", "right-height": "Right Height"},
	"CircleBeam": {"radius": "Radius"},
	"HollowCircleBeam": {"outer-radius": "Outer Radius", "inner-radius": "Inner Radius"},
	"DoubleTBeam": {},
};

$(function() {
	$(".dropdown-menu a").click(function(){
		$("#beam-selector-button").text($(this).text());

		if (dropdown_labels[$(this).text()] === undefined) {
			alert("Error: Invalid beam type");
			return;
		}

		current_beam_type = dropdown_labels[$(this).text()];
		show_image();
		add_fields();

		$("#calculator-card-body").removeClass("collapse");
	});
	$("#submit-button").click(function(){
		calculate();
	});
});

function show_image() {
	if (!current_beam_type) {
		return;
	}
	$("img").attr("src", "img/" + current_beam_type + ".svg");
}

function add_fields() {
	if (labels[current_beam_type] === undefined) {
		return;
	}
	let container = $("#input-container").empty();
	for (let id in labels[current_beam_type]) {
		label = labels[current_beam_type][id];
		container.append("<div class=\"form-group row\"><label class=\"col-form-label col-sm-4\" for=\"" + 
			id + "\">" + label + "</label>\n<input class=\"form-control col-sm-7\" id=\"" + 
			id + "\"></input></div>");
	}
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function get_variables() {
	if (labels[current_beam_type] === undefined) {
		return null;
	}
	let res = [];
	for (let variable in labels[current_beam_type]) {
		let text = $("#" + variable).val();
		if (isNumeric(text) && parseFloat(text) >= 0) {
			res.push(parseFloat(text));
		} else {
			alert("Error: Invalid " + labels[current_beam_type][variable]);
			return null;
		}
	}
	return res;
}

function calculate() {
	// Get variables
	let res = get_variables();
	if (res === undefined && res.length < 0) {
		return;
	}

	switch(current_beam_type) {
		case "RectangleBeam":
			current_beam = new RectangleBeam(...res);
			break;
		case "HollowRectangleBeam":
			current_beam = new HollowRectangleBeam(...res);
			break;
		case "TBeam":
			current_beam = new TBeam(...res);
			break;
		case "IBeam":
			current_beam = new IBeam(...res);
			break;
		case "HBeam":
			current_beam = new HBeam(...res);
			break;
		case "CircleBeam":
			current_beam = new CircleBeam(...res);
			break;
		case "HollowCircleBeam":
			current_beam = new HollowCircleBeam(...res);
			break;
		case "DoubleTBeam":
			current_beam = new DoubleTBeam(...res);
			break;
		default:
			return;
	}

	// Calculate values
	$("#area").val(current_beam.get_area());
	$("#xbar").val(current_beam.get_xbar());
	$("#ybar").val(current_beam.get_ybar());
	$("#moi").val(current_beam.get_moi());
}
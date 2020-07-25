
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
		return this.width.clone().times(this.height);
	}
	get_xbar() {
		return this.width.clone().div(2).plus(this.x);
	}
	get_ybar() {
		return this.height.clone().div(2).plus(this.y);
	}
	get_moi() {
		return this.height.clone().pow(3).times(this.width).div(12);
	}
}

class IsocelesTriangle {
	constructor(x, y, base, height, filled=true) {
		this.x = x;
		this.y = y;
		this.base = base;
		this.height = height;
		this.filled = filled;
	}
	get_area() {
		return this.base.clone().times(this.height).div(2);
	}
	get_xbar() {
		return this.width.clone().div(2).plus(this.x);
	}
	get_ybar() {
		return this.height.clone().div(3).plus(this.y);
	}
	get_moi() {
		return this.height.clone().pow(3).times(this.base).div(36);
	}
}

/*
 * The fraction library does not support pi, so the results of get_area() and get_moi()
 * need to be multiplied by pi at the end. Currently, this is handled during printing to
 * the UI.
 */
class Circle {
	constructor(x, y, radius, filled=true) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.filled = filled;
	}
	get_area() {
		return this.radius.clone().pow(2);
	}
	get_xbar() {
		return this.x.clone().plus(this.radius);
	}
	get_ybar() {
		return this.y.clone().plus(this.radius);
	}
	get_moi() {
		return this.radius.clone().pow(4).div(4);
	}
}

/* BEAMS */
class Beam {
	constructor() {
		this.shapes = [];
	}
	get_area() {
		let area = fc(0);
		for (let shape of this.shapes) {
			if (shape.filled) {
				area.plus(shape.get_area());
			} else {
				area.minus(shape.get_area());
			}
		}
		return area;
	}
	get_ybar() {
		let area = fc(0);
		let sum = fc(0);
		for (let shape of this.shapes) {
			if (shape.filled) {
				sum.plus(shape.get_ybar().times(shape.get_area()));
				area.plus(shape.get_area());
			} else {
				sum.minus(shape.get_ybar().times(shape.get_area()));
				area.minus(shape.get_area());
			}
		}
		return sum.div(area);
	}
	get_xbar() {
		let area = fc(0);
		let sum = fc(0);
		for (let shape of this.shapes) {
			if (shape.filled) {
				sum.plus(shape.get_xbar().times(shape.get_area()));
				area.plus(shape.get_area());
			} else {
				sum.minus(shape.get_xbar().times(shape.get_area()));
				area.minus(shape.get_area());
			}
		}
		return sum.div(area);
	}
	get_moi() {
		let ybar = this.get_ybar();
		let sum = fc(0);
		for (let shape of this.shapes) {
			let dy = shape.get_ybar().minus(ybar);
			if (shape.filled) {
				sum.plus(shape.get_area().times(dy.pow(2)).plus(shape.get_moi()));
			} else {
				sum.minus(shape.get_area().times(dy.pow(2)).plus(shape.get_moi()));
			}
		}
		return sum;
	}
}

class RectangleBeam extends Beam {
	constructor(base, height) {
		super();
		this.shapes.push(new Rectangle(fc(0), fc(0), base.clone(), height.clone()));
	}
}

class HollowRectangleBeam extends Beam {
	constructor(base, height, inner_base, inner_height) {
		super();
		if (inner_base.greaterThan(base) || inner_height.greaterThan(height)) {
			alert("Error: Inner sizes cannot be larger than outer sizes");
			return;
		}
		let dx = base.clone().minus(inner_base).div(2);
		let dy = height.clone().minus(inner_height).div(2);
		this.shapes.push(new Rectangle(fc(0), fc(0), base.clone(), height.clone()));
		this.shapes.push(new Rectangle(dx, dy, inner_base.clone(), inner_height.clone(), false));
	}
}

class TBeam extends Beam {
	constructor(upper_base, upper_height, lower_base, lower_height) {
		super();
		if (lower_base.greaterThan(upper_base)) {
			alert("Error: Lower base cannot be larger than upper base");
			return;
		}
		let dx = upper_base.clone().minus(lower_base).div(2);
		this.shapes.push(new Rectangle(dx, fc(0), lower_base.clone(), lower_height.clone()));
		this.shapes.push(new Rectangle(fc(0), lower_height.clone(), upper_base.clone(), upper_height.clone()));
	}
}

class IBeam extends Beam {
	constructor(upper_base, upper_height, middle_base, middle_height, lower_base, lower_height) {
		super();
		let max_x = max(upper_base, lower_base);
		let min_x = min(upper_base, lower_base);
		let diff_x = max_x.clone().minus(min_x);
		var upper_x, lower_x;
		if (upper_base.greaterThan(lower_base)) {
			upper_x = fc(0);
			lower_x = diff_x.clone().div(2);
		} else {
			upper_x = diff_x.clone().div(2);
			lower_x = fc(0);
		}
		this.shapes.push(new Rectangle(lower_x.clone(), fc(0), lower_base.clone(), lower_height.clone()));
		this.shapes.push(new Rectangle(max(max_x.clone().minus(middle_base).div(2), fc(0)), lower_height.clone(), middle_base.clone(), middle_height.clone()));
		this.shapes.push(new Rectangle(upper_x.clone(), lower_height.clone().plus(middle_height), upper_base.clone(), upper_height.clone()));
	}
}

class HBeam extends Beam {
	constructor(left_base, left_height, middle_base, middle_height, right_base, right_height) {
		super();
		let max_y = max(left_height, right_height);
		let min_y = min(left_height, right_height);
		let diff_y = max_y.clone().minus(min_y);
		var left_y, right_y;
		if (left_height.greaterThan(right_height)) {
			left_y = fc(0);
			right_y = diff_y.clone().div(2);
		} else {
			left_y = diff_y.clone().div(2);
			right_y = fc(0);
		}
		this.shapes.push(new Rectangle(fc(0), left_y.clone(), left_base.clone(), left_height.clone()));
		this.shapes.push(new Rectangle(left_base.clone(), max(max_y.clone().minus(middle_height).div(2), fc(0)), middle_base.clone(), middle_height.clone()));
		this.shapes.push(new Rectangle(left_base.clone().plus(middle_base), right_y.clone(), right_base.clone(), right_height.clone()));
	}
}

class CircleBeam extends Beam {
	constructor(radius) {
		super();
		this.shapes.push(new Circle(fc(0), fc(0), radius.clone()));
	}
}

class HollowCircleBeam extends Beam {
	constructor(outer_radius, inner_radius) {
		super();
		if (inner_radius.greaterThan(outer_radius)) {
			alert("Error: Inner sizes cannot be larger than outer sizes");
			return;
		}
		let thickness = outer_radius.clone().minus(inner_radius);
		this.shapes.push(new Circle(fc(0), fc(0), outer_radius.clone()));
		this.shapes.push(new Circle(thickness.clone(), thickness.clone(), inner_radius.clone(), false));
	}
}

class DoubleTBeam extends Beam {
	constructor(base1, height1, base2, height2, base3, height3) {
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
};

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

		// Reset outputs
		$("#area").val(0);
		$("#xbar").val(0);
		$("#ybar").val(0);
		$("#moi").val(0);

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

function get_variables() {
	if (labels[current_beam_type] === undefined) {
		return null;
	}
	let res = [];
	for (let variable in labels[current_beam_type]) {
		let text = $("#" + variable).val();
		try {
			res.push(fc(text));
		} catch(e) {
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

	// Create beam objects
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
	if ($("#toggle").prop("checked")) {
		print_decimal();
	} else {
		print_fraction();
	}
}

function print_decimal() {
	if (current_beam_type === "CircleBeam" || current_beam_type === "HollowCircleBeam") {
		$("#area").val(current_beam.get_area().toNumber() + "\u03C0");
		$("#moi").val(current_beam.get_moi().toNumber() + "\u03C0");
	} else {
		$("#area").val(current_beam.get_area().toNumber());
		$("#moi").val(current_beam.get_moi().toNumber());
	}
	$("#xbar").val(current_beam.get_xbar().toNumber());
	$("#ybar").val(current_beam.get_ybar().toNumber());
}

function print_fraction() {
	if (current_beam_type === "CircleBeam" || current_beam_type === "HollowCircleBeam") {
		$("#area").val(current_beam.get_area().toFraction() + "\u03C0");
		$("#moi").val(current_beam.get_moi().toFraction() + "\u03C0");
	} else {
		$("#area").val(current_beam.get_area().toFraction());
		$("#moi").val(current_beam.get_moi().toFraction());
	}
	$("#xbar").val(current_beam.get_xbar().toFraction());
	$("#ybar").val(current_beam.get_ybar().toFraction());
}

/* UTIL */
function max(a,b) {
	if (a.greaterThan(b)) {
		return a;
	}
	return b;
}

function min(a,b) {
	if (a.greaterThan(b)) {
		return b;
	}
	return a;
}

function fc_array_equal(a,b) {
	if (a === b)  {
		return true;
	}
	if (a == null || b == null) {
		return false;
	}
	if (a.length !== b.length) {
		return false;
	}

	for (let i = 0; i < a.length; i++) {
		if (!a[i].equals(b[i])) {
			return false;
		}
	}
	return true;
}

/* TESTS */
let tests = {
	"RectangleBeam": [
		{"args": [10,12], "results": [120,5,6,1440]},
		{"args": [3,10], "results": [30,1.5,5,250]},
		{"args": [12,1], "results": [12,6,0.5,1]},
	],
	"HollowRectangleBeam": [
		{"args": [12,12,6,6], "results": [108,6,6,1620]},
		{"args": [12,12,6,0], "results": [144,6,6,1728]},
		{"args": [12,12,0,0], "results": [144,6,6,1728]},
		{"args": [18,18,12,12], "results": [180,9,9,7020]},
		{"args": [18,12,12,6], "results": [144,9,6,2376]},
	],
	"TBeam": [
		{"args": [12,6,3,12], "results": [108,6,12,2592]},
		{"args": [12,1,0,0], "results": [12,6,0.5,1]},
	],
	"IBeam": [
		{"args": [20,5,5,20,20,5], "results": [300,10,15,35000]},
		{"args": [12,6,0,0,12,6], "results": [144,6,6,1728]},
		{"args": [12,6,3,12,0,0], "results": [108,6,12,2592]},
		{"args": [0,0,3,12,12,6], "results": [108,6,6,2592]},
		{"args": [10,4,4,10,10,4], "results": [120,5,9,4360]},
	],
	"HBeam": [
		{"args": [5,20,20,5,5,20], "results": [300,15,10,6875]},
		{"args": [0,0,12,1,0,0], "results": [12,6,0.5,1]},
		{"args": [12,1,0,0,0,0], "results": [12,6,0.5,1]},
		{"args": [0,0,0,0,12,1], "results": [12,6,0.5,1]},
		{"args": [4,10,10,4,4,10], "results": [120,9,5,720]},
	],
	"CircleBeam": [
		{"args": [2], "results": [4,2,2,4]},
		{"args": [4], "results": [16,4,4,64]},
	],
	"HollowCircleBeam": [
		{"args": [2,0], "results": [4,2,2,4]},
		{"args": [4,2], "results": [12,4,4,60]},
	],
}

function test() {
	for (let beam in labels) {
		test_beam(beam);
	}
	console.log("All cases passed!");
}

function test_beam(beam_type) {
	if (tests[beam_type] === undefined) {
		return;
	}
	for (let testcase of tests[beam_type]) {
		let args = fc_array(testcase["args"]);
		let correct = fc_array(testcase["results"]);
		var beam;
		switch(beam_type) {
			case "RectangleBeam":
				beam = new RectangleBeam(...args);
				break;
			case "HollowRectangleBeam":
				beam = new HollowRectangleBeam(...args);
				break;
			case "TBeam":
				beam = new TBeam(...args);
				break;
			case "IBeam":
				beam = new IBeam(...args);
				break;
			case "HBeam":
				beam = new HBeam(...args);
				break;
			case "CircleBeam":
				beam = new CircleBeam(...args);
				break;
			case "HollowCircleBeam":
				beam = new HollowCircleBeam(...args);
				break;
			case "DoubleTBeam":
				beam = new DoubleTBeam(...args);
				break;
			default:
				return;
		}
		let results = [beam.get_area(), beam.get_xbar(), beam.get_ybar(), beam.get_moi()]; 
		if (!fc_array_equal(results, correct)) {
			throw new Error("Test for " + beam_type + " failed with inputs " +
				fc_array_tostring(args) + ". Got " + fc_array_tostring(results) + 
				" but wanted " + fc_array_tostring(correct) + ".");
		}
	}	
}

/* TEST UTILS */
function fc_array(a) {
	let res = [];
	for (let i = 0; i < a.length; i++) {
		res.push(fc(a[i]));
	}
	return res;
}

function fc_array_tostring(a) {
	let res = "[";
	for (let i = 0; i < a.length; i++) {
		res += a[i].toFraction();
		if (i !== a.length - 1) {
			res += ",";
		}
	}
	res += "]"
	return res;
}
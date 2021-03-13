const margin = { t: 50, r: 50, b: 50, l: 50 };
const size = { w: 900, h: 900 };
const svg = d3.select("svg");

// defining a container group
// which will contain everything within the SVG
// we can transform it to make things everything zoomable
const containerG = svg
	.append("g")
	.classed("container", true)
	.attr("transform", `translate(${margin.l}, ${margin.t})`);

svg.attr("width", size.w).attr("height", size.h);

size.w = size.w - margin.l - margin.r;
size.h = size.h - margin.t - margin.b;

const dispatch = d3.dispatch("updateData");
const level = 0;

d3.json("data/flare-2.json").then(function (data) {
	console.log(data);

	drawTreemap(data);

	dispatch.on("updateData", function (name, currData) {
		if (!name) {
			drawTreemap(data);
			return;
		}
		console.log(currData);
		let filteredData = currData.children.filter((d) => d.name === name);
		// console.log(filteredData);
		drawTreemap(filteredData[0]);
	});
});

d3.select("button#reset").on("click", () => {
	dispatch.call("updateData", this);
});

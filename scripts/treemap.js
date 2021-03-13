function drawTreemap(data) {
	// create a heirarchy that can be understandable
	let hierarchy = d3
		.hierarchy(data) // data manipulation function not a layout function
		.sum((d) => d.value)
		.sort((a, b) => b.value - a.value);

	// adds summation of values of children
	// depth, height, parent
	// console.log(hierarchy);

	let treemapFn = d3
		.treemap()
		.size([size.w, size.h])
		.tile(d3.treemapSquarify)
		.padding(1);

	// d3.pack() for circle packing

	let treemap = treemapFn(hierarchy);
	// console.log(treemap);
	// adds x0, x1, y0, y1
	// width = x1 - x0, height = y1 - y0
	// d3 passes an array and create an svg object one by one
	// console.log(treemap.leaves());

	let domain = treemap.children.map((d) => d.data.name);
	// console.log(domain);
	let colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(domain);
	let opacityScale = d3
		.scaleLinear()
		.domain(d3.extent(treemap.leaves().map((d) => d.data.value)))
		.range([0, 1]);

	// let rectangles = containerG
	// 	.selectAll("rect")
	// 	.data(treemap.leaves())
	// 	.join("rect")
	// 	.attr("x", (d) => d.x0)
	// 	.attr("y", (d) => d.y0)
	// 	.attr("width", (d) => d.x1 - d.x0)
	// 	.attr("height", (d) => d.y1 - d.y0)
	// 	.attr("fill", (leafNode) => {
	// 		let node = leafNode;
	// 		while (node.depth > 1) {
	// 			node = node.parent;
	// 		}
	// 		// node -> deapth 1
	// 		// console.log("node", node);
	// 		return colorScale(node.data.name);
	// 	});

	let leafG = containerG
		.selectAll("g.leaf-node")
		.data(treemap.leaves())
		.join("g")
		.classed("leaf-node", true)
		.attr("transform", (d) => `translate(${d.x0}, ${d.y0})`)
		.attr("fill-opacity", 0.7)
		.style("cursor", (d) => (d.depth <= 1 ? "auto" : "pointer"))
		.on("mouseenter", hover)
		.on("mouseout", hoverEnd)
		.on("click", (event) => clicked(event, data));

	leafG
		.selectAll("rect")
		.data((d) => [d])
		.join("rect")
		// leafG
		// .append("rect")
		// .attr("x", (d) => d.x0)
		// .attr("y", (d) => d.y0)
		.attr("width", (d) => d.x1 - d.x0)
		.attr("height", (d) => d.y1 - d.y0)
		.attr("fill", (leafNode) => {
			let node = leafNode;
			while (node.depth > 1) {
				node = node.parent;
			}
			// node -> deapth 1
			// console.log("node", node);
			return colorScale(node.data.name);
		});
	// .attr("fill-opacity", (d) => opacityScale(d.data.value));

	leafG
		.selectAll("text")
		.data((d) => [d])
		.join("text")
		// leafG
		// 	.append("text")
		.attr("x", 4)
		.attr("y", "1.1em")
		.text((d) => d.data.readableName);
}

// // highlight all the rects in the same colored group
// function hover(event) {
//     let dataEle = d3.select(event.currentTarget)
//         .datum();
//     // console.log(dataEle);
//     let currentParent = dataEle;
//     while (currentParent.depth > 1) {
//         currentParent = currentParent.parent;
//     }
//     d3.selectAll('g.leaf-node')
//         .attr('fill-opacity', d => {
//             let x = d;
//             while (x.depth > 1) {
//                 x = x.parent;
//             }
//             if (x.data.name === currentParent.data.name) {
//                 return 1;
//             } else {
//                 return 0.7;
//             }
//         });
// }
function hover(event) {
	let dataEle = d3.select(event.currentTarget).datum();
	// console.log(dataEle);
	let currentParent = dataEle;
	while (currentParent.depth > 1) {
		currentParent = currentParent.parent;
	}
	d3.selectAll("g.leaf-node").attr("fill-opacity", (d) => {
		let x = d;
		while (x.depth > 1) {
			x = x.parent;
		}
		if (x.data.name === currentParent.data.name) {
			return 1;
		} else {
			return 0.7;
		}
	});
}

function hoverEnd(event) {
	d3.selectAll("g.leaf-node").attr("fill-opacity", 0.7);
}

function clicked(event, data) {
	let d = d3.select(event.currentTarget).datum(); // data means array of object. data() will return an array of object. datum() will return an object.
	if (d.depth <= 1) return;
	let x = d;
	while (x.depth > 1) {
		x = x.parent;
	}

	dispatch.call(
		"updateData",
		this,
		/* parentName */ x.data.name,
		/* currentdata */ data
	);
}

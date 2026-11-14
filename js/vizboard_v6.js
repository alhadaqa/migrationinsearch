var TxtType = function (el, toRotate, period) {
    this.toRotate = toRotate;
    this.el = el;
    this.loopNum = 0;
    this.period = parseInt(period, 10) || 2000;
    this.txt = "";
    this.tick();
    this.isDeleting = false;
};

TxtType.prototype.tick = function () {
    var i = this.loopNum % this.toRotate.length;
    var fullTxt = this.toRotate[i];

    if (this.isDeleting) {
        this.txt = fullTxt.substring(0, this.txt.length - 1);
    } else {
        this.txt = fullTxt.substring(0, this.txt.length + 1);
    }

    this.el.innerHTML = '<span class="wrap">' + this.txt + "</span>";

    var that = this;
    var delta = 200 - Math.random() * 100;

    if (this.isDeleting) {
        delta /= 2;
    }

    if (!this.isDeleting && this.txt === fullTxt) {
        delta = this.period;
        this.isDeleting = true;
    } else if (this.isDeleting && this.txt === "") {
        this.isDeleting = false;
        this.loopNum++;
        delta = 500;
    }

    setTimeout(function () {
        that.tick();
    }, delta);
};

window.onload = function () {
    var elements = document.getElementsByClassName("typewrite");
    for (var i = 0; i < elements.length; i++) {
        var toRotate = elements[i].getAttribute("data-type");
        var period = elements[i].getAttribute("data-period");
        if (toRotate) {
            new TxtType(elements[i], JSON.parse(toRotate), period);
        }
    }
    // INJECT CSS
    var css = document.createElement("style");
    css.type = "text/css";
    css.innerHTML = ".typewrite > .wrap { border-right: 0.08em solid #fff}";
    document.body.appendChild(css);
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 00. Global letiables  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let svg_01;
let svg_02;

var selected_country_global;

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Colors  ////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Background
let background_col = "#03092a";
let back_ref_col = "#240437";
let world_map_col = "blue";

let real_orig_col = "#03fcdb";
let dream_orig_col = "#e30084";

let real_dest_col = "#03fcdb"; //#03fcdb
let dream_dest_col = "#e30084";

let ref_col = "grey";

let real_area_s_col = "#03fcdb";
let dream_area_s_col = "#e30084";

let real_txt_col = "#b0fff4";
let dream_txt_col = "#ff82cb";

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 00. Data  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const migrants_avg_file = "data_real_dream_norm.csv";
const origins_avg_file = "map_data_01.csv";
const destinations_avg_file = "map_data_02.csv";
const map_geo_file = "world_map_ar.geojson";

// full data
const migrants_file = "data_real_dream_final.csv";
const migrants_world_file = "real_dream_world_data.csv";

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Data Converter /////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//=====< Datasets >====================================================================>
let migrants_avg_data = [];
let migrants_data = [];
let migrants_world_data = [];

let origin_avg_data = [];
let destination_avg_data = [];
let world_map = {};

//=====< Converter Function >==========================================================>
let migrants_avg_converter = function (point) {
    return {
        serial: +point.serial,
        country: point.country,
        country_iso: point.country_iso,
        continent: point.continent,
        coord: [+point.long, +point.lat],
        lat: +point.lat,
        long: +point.long,
        orig_real: +point.orig_real,
        dest_real: +point.dest_real,
        orig_dream: +point.orig_dream,
        dest_dream: +point.dest_dream,
    };
};

let migrants_converter = function (point) {
    return {
        orig: point.origin,
        orig_iso: point.origin_iso,
        orig_continent: point.continent_origin,
        orig_coord: [+point.long_origin, +point.lat_origin],

        dest: point.destination,
        dest_iso: point.destination_iso,
        dest_continent: point.continent_destination,
        dest_coord: [+point.long_destination, +point.lat_destination],
        year: +point.year,

        real_orig_migrants: +point.real_orig_migrants,
        dream_orig_migrants: +point.dream_orig_migrants,
        real_dest_migrants: +point.real_dest_migrants,
        dream_dest_migrants: +point.dream_dest_migrants,

        real_orig_migrants_avg: +point.real_orig_migrants_avg,
        dream_orig_migrants_avg: +point.dream_orig_migrants_avg,
        real_dest_migrants_avg: +point.real_dest_migrants_avg,
        dream_dest_migrants_avg: +point.dream_dest_migrants_avg,

        orig_orig_real: +point.orig_orig_real,
        orig_orig_dream: +point.orig_orig_dream,
        orig_dest_real: +point.orig_dest_real,
        orig_dest_dream: +point.orig_dest_dream,

        dest_orig_real: +point.dest_orig_real,
        dest_orig_dream: +point.dest_orig_dream,
        dest_dest_real: +point.dest_dest_real,
        dest_dest_dream: +point.dest_dest_dream,

        orig_real_fact: +point.orig_real_fact,
        orig_dream_fact: +point.orig_dream_fact,
        dest_real_fact: +point.dest_real_fact,
        dest_dream_fact: +point.dest_dream_fact,
    };
};

let migrants_world_converter = function (point) {
    return {
        country: point.country,
        country_iso: point.country_iso,
        year: +point.year,

        total_avg_out: +point.total_avg_out,
        migrants_out: +point.migrants_out,
        total_avg_in: +point.total_avg_in,
        migrants_in: +point.migrants_in,

        gtotal_avg_out: +point.gtotal_avg_out,
        gmigrants_out: +point.gmigrants_out,
        gtotal_avg_in: +point.gtotal_avg_in,
        gmigrants_in: +point.gmigrants_in,
    };
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Promise all ////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

Promise.all([
    d3.csv(migrants_avg_file, migrants_avg_converter),
    d3.csv(migrants_world_file, migrants_world_converter),
    d3.csv(migrants_file, migrants_converter),
    d3.csv(origins_avg_file, migrants_avg_converter),
    d3.csv(destinations_avg_file, migrants_avg_converter),
    d3.json(map_geo_file),
]).then(function ([migrants_avg, migrants_world, migrants_full, origin_migrants, destination_migrants, map]) {
    // save data in dataset letiable
    migrants_avg_data = migrants_avg;
    migrants_world_data = migrants_world;
    migrants_data = migrants_full;
    origin_avg_data = origin_migrants.filter((d) => d.orig_real > 0 || d.orig_dream > 0);
    destination_avg_data = destination_migrants.filter((d) => d.dest_real > 0 || d.dest_dream > 0);

    // store map shapes
    world_map = map.features;
    world_map = world_map.filter((d) => d.properties.name != "Antarctica");

    // console.log
    // console.log(migrants_data[0]);
    // console.log(world_map);
    // console.log(origin_avg_data);
    // console.log(destination_avg_data);
    // console.log(migrants_world_data[0]);

    // call the draw function
    dataviz_01();
    dataviz_02();
    dataviz_03();
}); //end of then method

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 01. SVG_01  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Dimensions
let dimensions_01 = {
    width: window.innerWidth * 0.95,
    height: window.innerHeight * 0.9,
    margin: {
        top: 120,
        right: 100,
        bottom: 120,
        left: 100,
    },
};

//Define drawing area within "dimensions" object
dimensions_01.vizboardWidth = dimensions_01.width - dimensions_01.margin.left - dimensions_01.margin.right;
dimensions_01.vizboardHeight = dimensions_01.height - dimensions_01.margin.top - dimensions_01.margin.bottom;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Draw SVG
const vizboard_width_01 = 1200;
const vizboard_height_01 = 640;

let svg_vizboard_01 = d3
    .select("#svg-vizboard-01")
    .append("svg")
    .classed("svg-vizboard-01", true)
    .attr("viewBox", `0 0 ${vizboard_width_01} ${vizboard_height_01}`)
    .attr("preserveAspectRatio", "xMinYMin meet");
// .style("border", "1px dashed pink");

svg_01 = svg_vizboard_01.append("g").style("transform", `translate(${dimensions_01.margin.left}px, ${dimensions_01.margin.top}px)`);

// Create SVG dimensions
const width_01 = vizboard_width_01 - dimensions_01.margin.left - dimensions_01.margin.right;
const height_01 = vizboard_height_01 - dimensions_01.margin.top - dimensions_01.margin.bottom;

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 01. dataviz_01  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const dataviz_01 = function () {
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Nested Data ////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //=====< Origin Data >=========================================================>
    //====== https://observablehq.com/@d3/d3-flatgroup

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Scales  ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Interaction Settings ///////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //=====< Setup >===============================================================================>
    //=============================================================================================>
    //=====< Map's Circles Location Function >=====================================================>
    let get_cxy = function (iso) {
        let x = d3.select(`#${iso}`).attr("cx");
        let y = d3.select(`#${iso}`).attr("cy");
        return { cx: x, cy: y };
    };

    //=====< Iso to Serial Function >==============================================================>
    let iso_serial_fun = function (x) {
        let iso_serial = d3
            .flatGroup(
                migrants_avg_data,
                (d) => d.country_iso,
                (d) => d.serial
            )
            .map((d, i) => {
                return {
                    iso: d[0],
                    serial: d[1],
                };
            })
            .filter((d) => d.iso == x)[0].serial;
        return iso_serial - 1;
    };

    //=====< Iso to Name Function >==============================================================>
    let iso_country_fun = function (x) {
        let iso_name = migrants_avg_data.filter((d) => d.country_iso == x)[0].country;
        return iso_name;
    };
    //=====< Iso to Name Function >==============================================================>
    country_iso_fun = function (x) {
        let iso_name = migrants_avg_data.filter((d) => d.country == x)[0].country_iso;
        return iso_name;
    };

    // console.log(country_iso_fun("Egypt"));
    //=====< Sum Function >=======================================================================>
    let iso_sum_fun = function (iso) {
        return migrants_sum_data.filter((d) => d.country_iso == iso)[0];
    };

    //=====< Setup >===============================================================================>
    let year_x = 2020;
    let t_sec = 700;

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Area Chart  ////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const real_orig_svg_01_real_dream = svg_01.append("g");
    const real_dest_svg_01_real_dream = svg_01.append("g");
    const dream_orig_svg_01_real_dream = svg_01.append("g");
    const dream_dest_svg_01_real_dream = svg_01.append("g");

    // svg_01_real_dream.style("visibility", "hidden");

    // let country_name = "Egypt";
    // let selected_country_iso = country_iso_fun(country_name);

    // sorting functions
    let real_orig_sort_01 = function (a, b) {
        return b.real_orig_migrants_avg - a.real_orig_migrants_avg;
    };

    let real_dest_sort_01 = function (a, b) {
        return b.real_dest_migrants_avg - a.real_dest_migrants_avg;
    };

    let dream_orig_sort_01 = function (a, b) {
        return b.dream_orig_migrants_avg - a.dream_orig_migrants_avg;
    };

    let dream_dest_sort_01 = function (a, b) {
        return b.dream_dest_migrants_avg - a.dream_dest_migrants_avg;
    };

    // General letiables
    let orig_orig_real_01;
    let orig_orig_dream_01;
    let orig_dest_real_01;
    let orig_dest_dream_01;

    let orig_r_f_01;
    let orig_d_f_01;
    let dest_r_f_01;
    let dest_d_f_01;

    let area_opacity_01 = d3.scaleLinear().domain([0, 100]).range([0.01, 0.4]);

    let real_orig_x_01 = d3
        .scaleLinear()
        .domain([2005, 2020])
        .range([0, width_01 / 2 - 30]);
    let real_dest_x_01 = d3
        .scaleLinear()
        .domain([2005, 2020])
        .range([0, width_01 / 2 - 30]);
    let dream_orig_x_01 = d3
        .scaleLinear()
        .domain([2005, 2020])
        .range([width_01 / 2 + 30, width_01]);
    let dream_dest_x_01 = d3
        .scaleLinear()
        .domain([2005, 2020])
        .range([width_01 / 2 + 30, width_01]);

    // Real Origin letiables
    let real_orig_area_data_01;
    let real_dest_area_data_01;
    let dream_orig_area_data_01;
    let dream_dest_area_data_01;

    let real_orig_area_countries_01;
    let real_dest_area_countries_01;
    let dream_orig_area_countries_01;
    let dream_dest_area_countries_01;

    let real_orig_area_countries_iso_01;
    let real_dest_area_countries_iso_01;
    let dream_orig_area_countries_iso_01;
    let dream_dest_area_countries_iso_01;

    let real_orig_area_countries_n_01;
    let real_dest_area_countries_n_01;
    let dream_orig_area_countries_n_01;
    let dream_dest_area_countries_n_01;

    let real_orig_area_data_stack_01;
    let real_dest_area_data_stack_01;
    let dream_orig_area_data_stack_01;
    let dream_dest_area_data_stack_01;

    let real_orig_area_data_stack_conv_01;
    let real_dest_area_data_stack_conv_01;
    let dream_orig_area_data_stack_conv_01;
    let dream_dest_area_data_stack_conv_01;

    let real_orig_y_01;
    let real_dest_y_01;
    let dream_orig_y_01;
    let dream_dest_y_01;

    let real_orig_color_01;
    let real_dest_color_01;
    let dream_orig_color_01;
    let dream_dest_color_01;

    let real_orig_area_chart_01;
    let real_dest_area_chart_01;
    let dream_orig_area_chart_01;
    let dream_dest_area_chart_01;

    let real_orig_area_chart_txt_01;
    let real_dest_area_chart_txt_01;
    let dream_orig_area_chart_txt_01;
    let dream_dest_area_chart_txt_01;
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Tooltip  ///////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    let atooltip_wrapper_01 = svg_01
        .append("g")
        .attr("class", "atooltip-wrapper-01")
        .attr("transform", "translate(" + 0 + "," + 0 + ")")
        .style("font-size", `12px`)
        .style("opacity", 1);

    let atooltip_background_01 = atooltip_wrapper_01
        .append("rect")
        .attr("class", "atooltip-background-01")
        .attr("x", 0)
        .attr("y", 13)
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("width", 0)
        .attr("height", 26)
        .style("opacity", 0.8)
        .style("fill", background_col);

    let atooltip_country_01 = atooltip_wrapper_01
        .append("text")
        .attr("class", "atooltip-country-01")
        .attr("id", "atooltip_country_01")
        .style("text-align", "center")
        .style("text-anchor", "middle")
        .style("alignment-baseline", "middle")
        .attr("y", 27)
        .style("fill", "#adadad")
        .text("");

    //=====< 1. Real Origin Area Chart >===========================================================>
    //=============================================================================================>
    //=============================================================================================>
    //=============================================================================================>

    let real_orig_area_chart_fun_01 = function (selected_country_iso) {
        real_orig_area_data_01 = migrants_data.filter((d) => d.orig_iso == selected_country_iso && d.real_orig_migrants_avg > 0);

        real_orig_area_data_01 = real_orig_area_data_01.sort(real_orig_sort_01);

        orig_orig_real_01 = real_orig_area_data_01[0].orig_real_fact;
        orig_orig_dream_01 = real_orig_area_data_01[0].orig_dream_fact;
        orig_dest_real_01 = real_orig_area_data_01[0].orig_real_fact;
        orig_dest_dream_01 = real_orig_area_data_01[0].orig_dream_fact;

        orig_r_f_01 = orig_orig_real_01;
        orig_d_f_01 = orig_orig_dream_01;
        dest_r_f_01 = orig_dest_real_01;
        dest_d_f_01 = orig_dest_dream_01;

        // console.log(orig_orig_real, orig_orig_dream, orig_dest_real, orig_dest_dream);
        console.log(orig_r_f_01, orig_d_f_01, dest_r_f_01, dest_d_f_01);
        // console.log(orig_orig_real, orig_orig_dream);
        // console.log(orig_r_f, orig_d_f);

        real_orig_area_countries_01 = d3
            .flatGroup(
                real_orig_area_data_01,
                (d) => d.dest,
                (d) => d.dest_iso
            )
            .map(function (d, i) {
                return {
                    country: d[0],
                    country_iso: d[1],
                    country_data: d[2],
                };
            })
            .map(function (d, i) {
                return d.country;
            });

        real_orig_area_countries_iso_01 = d3
            .flatGroup(
                real_orig_area_data_01,
                (d) => d.dest,
                (d) => d.dest_iso
            )
            .map(function (d, i) {
                return {
                    country: d[0],
                    country_iso: d[1],
                    country_data: d[2],
                };
            })
            .map(function (d, i) {
                return d.country_iso;
            });

        // console.log(real_orig_area_countries_iso);

        // countries serial
        real_orig_area_countries_n_01 = d3.range(0, real_orig_area_countries_01.length, 1);
        // console.log(real_orig_area_countries_n);

        // stack data
        real_orig_area_data_stack_01 = d3.group(real_orig_area_data_01, (d) => d.year);

        // console.log(real_orig_area_data_stack);

        // d3.stack
        real_orig_area_data_stack_conv_01 = d3
            .stack()
            .keys(real_orig_area_countries_n_01)
            .value((d, key) => d[1][key].real_orig_migrants)(real_orig_area_data_stack_01);

        // console.log(real_orig_area_data_stack_conv);

        // Chart Scales -----------------------------------------------------------------------------------
        // real_orig_y = d3
        //     .scaleLinear()
        //     .domain([0, 100])
        //     .range([height_01 / 2 - 25, 0]);

        real_orig_y_01 = d3
            .scaleLinear()
            .domain([0, 100])
            .range([height_01 - 25, 70]);

        // color scale
        real_orig_color_01 = d3
            .scaleLinear()
            .domain([0, real_orig_area_countries_01.length - 1])
            .range([0.8, 0.2]);

        // Area Chart -------------------------------------------------------------------------------------
        real_orig_area_chart_01 = real_orig_svg_01_real_dream
            .selectAll("path.real-orig-area-chart-01")
            .data(real_orig_area_data_stack_conv_01)
            .join("path")
            .attr("class", (d, i) => `real-orig-area-chart-01 ${real_orig_area_countries_iso_01[i]}`)
            .style("fill-opacity", (d, i) => real_orig_color_01(i) - 0.05)
            .style("stroke-opacity", (d, i) => real_orig_color_01(i) + 0.2)
            .style("stroke-width", (d, i) => real_orig_color_01(i) + 0.1)
            .style("fill", (d, i) => real_area_s_col)
            .style("stroke", (d, i) => real_area_s_col)
            .attr(
                "d",
                d3
                    .area()
                    .x((d, i) => real_orig_x_01(d.data[0]))
                    .y0((d) => real_orig_y_01(d[0] * orig_r_f_01))
                    .y1((d) => real_orig_y_01(d[1] * orig_r_f_01))
                    .curve(d3.curveBasis)
            );

        let real_orig_area_chart_up_01 = d3.selectAll("path.real-orig-area-chart-01").data(real_orig_area_data_stack_conv_01);
        real_orig_area_chart_up_01.exit().remove();
        real_orig_area_chart_up_01
            .join("path")
            .attr("class", (d, i) => `real-orig-area-chart-01 ${real_orig_area_countries_iso_01[i]}`)
            .style("fill-opacity", (d, i) => real_orig_color_01(i) - 0.05)
            .style("stroke-opacity", (d, i) => real_orig_color_01(i) + 0.3)
            .style("stroke-width", (d, i) => real_orig_color_01(i) + 0.3)
            .attr(
                "d",
                d3
                    .area()
                    .x((d, i) => real_orig_x_01(d.data[0]))
                    .y0((d) => real_orig_y_01(d[0] * orig_r_f_01))
                    .y1((d) => real_orig_y_01(d[1] * orig_r_f_01))
                    .curve(d3.curveBasis)
            );

        real_orig_area_chart_txt_01 = real_orig_svg_01_real_dream
            .selectAll("text.real-orig-area-chart-01-txt")
            .data(real_orig_area_data_stack_conv_01)
            .join("text")
            .attr("class", (d, i) => `real-orig-area-chart-01-txt`)
            .style("text-align", "center")
            .style("text-anchor", "middle")
            .style("alignment-baseline", "middle")
            .style("font-size", "10px")
            .text((d, i) => (d[7].data[1][i].real_orig_migrants_avg * orig_r_f_01 > 20 ? d[7].data[1][i].dest : ""))
            .attr("x", (d, i) => real_orig_x_01(2012.5))
            .attr("y", (d, i) => real_orig_y_01(d[7][0] + ((d[7][1] - d[7][0]) / 2) * orig_r_f_01))
            .style("fill", real_txt_col);

        real_orig_area_chart_01
            .on("mousemove", function () {
                atooltip_wrapper_01.style("opacity", 1).style("visibility", "visible");

                // get secondary class
                let selected_country = d3.select(this).attr("class").split(" ")[1];
                let el_box = d3.select(this).node().getBBox();
                let x_country = el_box.x + el_box.width / 2;
                // x_country = event.clientX;
                let y_country = el_box.y + el_box.height / 2 - 10;
                // y_country = event.clientY;

                atooltip_country_01.text(iso_country_fun(selected_country));

                let maxSize = document.getElementById("atooltip_country_01").getComputedTextLength();

                atooltip_background_01
                    .transition()
                    .duration(100)
                    .attr("x", -0.5 * maxSize * 1.6)
                    .attr("width", maxSize * 1.6);

                atooltip_wrapper_01
                    .transition()
                    .duration(100)
                    .attr("transform", "translate(" + (x_country - maxSize * 0.5) + "," + y_country + ")")
                    .style("opacity", 1);

                // select path
                d3.select(`.real-orig-area-chart-01.${selected_country}`).style("fill", "#008a77");
            })
            .on("mouseout", function () {
                atooltip_wrapper_01.style("opacity", 0).style("visibility", "hidden");

                // select path
                d3.selectAll(`.real-orig-area-chart-01`).style("fill", real_area_s_col);
            });
    };
    //=====< 2. Real Destination Area Chart >======================================================>
    //=============================================================================================>
    //=============================================================================================>
    //=============================================================================================>
    let real_dest_area_chart_fun_01 = function (selected_country_iso) {
        real_dest_area_data_01 = migrants_data.filter((d) => d.dest_iso == selected_country_iso && d.real_dest_migrants_avg > 0);
        // console.log(real_dest_area_data);

        real_dest_area_data_01 = real_dest_area_data_01.sort(real_dest_sort_01);

        real_dest_area_countries_01 = d3
            .flatGroup(
                real_dest_area_data_01,
                (d) => d.orig,
                (d) => d.orig_iso
            )
            .map(function (d, i) {
                return {
                    country: d[0],
                    country_iso: d[1],
                    country_data: d[2],
                };
            })
            .map(function (d, i) {
                return d.country;
            });

        real_dest_area_countries_iso_01 = d3
            .flatGroup(
                real_dest_area_data_01,
                (d) => d.orig,
                (d) => d.orig_iso
            )
            .map(function (d, i) {
                return {
                    country: d[0],
                    country_iso: d[1],
                    country_data: d[2],
                };
            })
            .map(function (d, i) {
                return d.country_iso;
            });

        // countries serial
        real_dest_area_countries_n_01 = d3.range(0, real_dest_area_countries_01.length, 1);

        // stack data
        real_dest_area_data_stack_01 = d3.group(real_dest_area_data_01, (d) => d.year);

        // d3.stack
        real_dest_area_data_stack_conv_01 = d3
            .stack()
            .keys(real_dest_area_countries_n_01)
            .value((d, key) => d[1][key].real_dest_migrants)(real_dest_area_data_stack_01);

        // Chart Scales -----------------------------------------------------------------------------------
        real_dest_y_01 = d3
            .scaleLinear()
            .domain([0, 100])
            .range([height_01 / 2 + 25, height_01]);

        // color scale
        real_dest_color_01 = d3
            .scaleLinear()
            .domain([0, real_dest_area_countries_01.length - 1])
            .range([0.8, 0.2]);

        // Area Chart -------------------------------------------------------------------------------------
        real_dest_area_chart_01 = real_dest_svg_01_real_dream
            .selectAll("path.real-dest-area-chart-01")
            .data(real_dest_area_data_stack_conv_01)
            .join("path")
            .attr("class", (d, i) => `real-dest-area-chart-01 ${real_dest_area_countries_iso_01[i]}`)
            .style("fill-opacity", (d, i) => real_dest_color_01(i) - 0.05)
            .style("stroke-opacity", (d, i) => real_dest_color_01(i) + 0.2)
            .style("stroke-width", (d, i) => real_dest_color_01(i) + 0.1)

            .style("fill", (d, i) => real_area_s_col)
            .style("stroke", (d, i) => real_area_s_col)
            .attr(
                "d",
                d3
                    .area()
                    .x((d, i) => real_dest_x_01(d.data[0]))
                    .y0((d) => real_dest_y_01(d[0] * dest_r_f_01))
                    .y1((d) => real_dest_y_01(d[1] * dest_r_f_01))
                    .curve(d3.curveBasis)
            );

        let real_dest_area_chart_up_01 = d3.selectAll("path.real-dest-area-chart-01").data(real_dest_area_data_stack_conv_01);
        real_dest_area_chart_up_01.exit().remove();
        real_dest_area_chart_up_01
            .join("path")
            .attr("class", (d, i) => `real-dest-area-chart-01 ${real_dest_area_countries_iso_01[i]}`)
            .style("fill-opacity", (d, i) => real_dest_color_01(i) - 0.05)
            .style("stroke-opacity", (d, i) => real_dest_color_01(i) + 0.3)
            .style("stroke-width", (d, i) => real_dest_color_01(i) + 0.3)
            .attr(
                "d",
                d3
                    .area()
                    .x((d, i) => real_dest_x_01(d.data[0]))
                    .y0((d) => real_dest_y_01(d[0] * dest_r_f_01))
                    .y1((d) => real_dest_y_01(d[1] * dest_r_f_01))
                    .curve(d3.curveBasis)
            );

        let real_dest_area_chart_txt_01 = real_dest_svg_01_real_dream
            .selectAll("text.real-dest-area-chart-01-txt")
            .data(real_dest_area_data_stack_conv_01)
            .join("text")
            .attr("class", (d, i) => `real-dest-area-chart-01-txt`)
            .style("text-align", "center")
            .style("text-anchor", "middle")
            .style("alignment-baseline", "middle")
            .style("font-size", "10px")
            .text((d, i) => (d[7].data[1][i].real_dest_migrants_avg * dest_r_f_01 > 15 ? d[7].data[1][i].orig : ""))
            .attr("x", (d, i) => real_dest_x_01(2012.5))
            .attr("y", (d, i) => real_dest_y_01(d[7][0] + ((d[7][1] - d[7][0]) / 2) * dest_r_f_01))
            .style("fill", real_txt_col);

        real_dest_area_chart_01
            .on("mouseover", function () {
                atooltip_wrapper_01.style("opacity", 1).style("visibility", "visible");

                // get secondary class
                let selected_country = d3.select(this).attr("class").split(" ")[1];
                let el_box = d3.select(this).node().getBBox();
                let x_country = el_box.x + el_box.width / 2;
                // x_country = event.clientX;
                let y_country = el_box.y + el_box.height / 2 - 10;
                // y_country = event.clientY;

                atooltip_country_01.text(iso_country_fun(selected_country));

                let maxSize = document.getElementById("atooltip_country_01").getComputedTextLength();

                atooltip_background_01
                    .transition()
                    .duration(100)
                    .attr("x", -0.5 * maxSize * 1.6)
                    .attr("width", maxSize * 1.6);

                atooltip_wrapper_01
                    .transition()
                    .duration(100)
                    .attr("transform", "translate(" + (x_country - maxSize * 0.5) + "," + y_country + ")")
                    .style("opacity", 1);

                // select path
                d3.select(`.real-dest-area-chart-01.${selected_country}`).style("fill", "#008a77");
            })
            .on("mouseout", function () {
                atooltip_wrapper_01.style("opacity", 0).style("visibility", "hidden");

                // select path
                d3.selectAll(`.real-dest-area-chart-01`).style("fill", real_area_s_col);
            });
    };
    //=====< 3. Dream Origin Area Chart >==========================================================>
    //=============================================================================================>
    //=============================================================================================>
    //=============================================================================================>

    let dream_orig_area_chart_fun_01 = function (selected_country_iso) {
        dream_orig_area_data_01 = migrants_data.filter((d) => d.orig_iso == selected_country_iso && d.dream_orig_migrants_avg > 0);

        dream_orig_area_data_01 = dream_orig_area_data_01.sort(dream_orig_sort_01);

        dream_orig_area_countries_01 = d3
            .flatGroup(
                dream_orig_area_data_01,
                (d) => d.dest,
                (d) => d.dest_iso
            )
            .map(function (d, i) {
                return {
                    country: d[0],
                    country_iso: d[1],
                    country_data: d[2],
                };
            })
            .map(function (d, i) {
                return d.country;
            });

        dream_orig_area_countries_iso_01 = d3
            .flatGroup(
                dream_orig_area_data_01,
                (d) => d.dest,
                (d) => d.dest_iso
            )
            .map(function (d, i) {
                return {
                    country: d[0],
                    country_iso: d[1],
                    country_data: d[2],
                };
            })
            .map(function (d, i) {
                return d.country_iso;
            });

        // console.log(real_orig_area_countries_iso);

        // countries serial
        dream_orig_area_countries_n_01 = d3.range(0, dream_orig_area_countries_01.length, 1);
        // console.log(real_orig_area_countries_n);

        // stack data
        dream_orig_area_data_stack_01 = d3.group(dream_orig_area_data_01, (d) => d.year);

        // console.log(real_orig_area_data_stack);

        // d3.stack
        dream_orig_area_data_stack_conv_01 = d3
            .stack()
            .keys(dream_orig_area_countries_n_01)
            .value((d, key) => d[1][key].dream_orig_migrants)(dream_orig_area_data_stack_01);

        // console.log(real_orig_area_data_stack_conv);

        // Chart Scales -----------------------------------------------------------------------------------
        dream_orig_y_01 = d3
            .scaleLinear()
            .domain([0, 100])
            .range([height_01 - 25, 70]);

        // color scale
        dream_orig_color_01 = d3
            .scaleLinear()
            .domain([0, dream_orig_area_countries_01.length - 1])
            .range([0.8, 0.2]);

        // Area Chart -------------------------------------------------------------------------------------
        dream_orig_area_chart_01 = dream_orig_svg_01_real_dream
            .selectAll("path.dream-orig-area-chart-01")
            .data(dream_orig_area_data_stack_conv_01)
            .join("path")
            .attr("class", (d, i) => `dream-orig-area-chart-01 ${dream_orig_area_countries_iso_01[i]}`)
            .style("fill-opacity", (d, i) => dream_orig_color_01(i) - 0.05)
            .style("stroke-opacity", (d, i) => dream_orig_color_01(i) + 0.2)
            .style("stroke-width", (d, i) => dream_orig_color_01(i) + 0.1)
            .style("fill", (d, i) => dream_area_s_col)
            .style("stroke", (d, i) => dream_area_s_col)
            .attr(
                "d",
                d3
                    .area()
                    .x((d, i) => dream_orig_x_01(d.data[0]))
                    .y0((d) => dream_orig_y_01(d[0] * orig_d_f_01))
                    .y1((d) => dream_orig_y_01(d[1] * orig_d_f_01))
                    .curve(d3.curveBasis)
            );

        let dream_orig_area_chart_up_01 = d3.selectAll("path.dream-orig-area-chart-01").data(dream_orig_area_data_stack_conv_01);
        dream_orig_area_chart_up_01.exit().remove();
        dream_orig_area_chart_up_01
            .join("path")
            .attr("class", (d, i) => `dream-orig-area-chart-01 ${dream_orig_area_countries_iso_01[i]}`)
            .style("fill-opacity", (d, i) => dream_orig_color_01(i) - 0.05)
            .style("stroke-opacity", (d, i) => dream_orig_color_01(i) + 0.3)
            .style("stroke-width", (d, i) => dream_orig_color_01(i) + 0.3)
            .attr(
                "d",
                d3
                    .area()
                    .x((d, i) => dream_orig_x_01(d.data[0]))
                    .y0((d) => dream_orig_y_01(d[0] * orig_d_f_01))
                    .y1((d) => dream_orig_y_01(d[1] * orig_d_f_01))
                    .curve(d3.curveBasis)
            );

        dream_orig_area_chart_txt_01 = dream_orig_svg_01_real_dream
            .selectAll("text.dream-orig-area-chart-01-txt")
            .data(dream_orig_area_data_stack_conv_01)
            .join("text")
            .attr("class", (d, i) => `dream-orig-area-chart-01-txt`)
            .style("text-align", "center")
            .style("text-anchor", "middle")
            .style("alignment-baseline", "middle")
            .style("font-size", "10px")
            .text((d, i) => (d[7].data[1][i].dream_orig_migrants_avg * orig_d_f_01 > 10 ? d[7].data[1][i].dest : ""))
            .attr("x", (d, i) => dream_orig_x_01(2012.5))
            .attr("y", (d, i) => dream_orig_y_01(d[7][0] + ((d[7][1] - d[7][0]) / 2) * orig_d_f_01))
            .style("fill", dream_txt_col);

        dream_orig_area_chart_01
            .on("mousemove", function () {
                atooltip_wrapper_01.style("opacity", 1).style("visibility", "visible");

                // get secondary class
                let selected_country = d3.select(this).attr("class").split(" ")[1];
                let el_box = d3.select(this).node().getBBox();
                let x_country = el_box.x + el_box.width / 2;
                // x_country = event.clientX;
                let y_country = el_box.y + el_box.height / 2 - 10;
                // y_country = event.clientY;

                atooltip_country_01.text(iso_country_fun(selected_country));

                let maxSize = document.getElementById("atooltip_country_01").getComputedTextLength();

                atooltip_background_01
                    .transition()
                    .duration(100)
                    .attr("x", -0.5 * maxSize * 1.6)
                    .attr("width", maxSize * 1.6);

                atooltip_wrapper_01
                    .transition()
                    .duration(100)
                    .attr("transform", "translate(" + (x_country - maxSize * 0.5) + "," + y_country + ")")
                    .style("opacity", 1);

                // select path
                d3.select(`.dream-orig-area-chart-01.${selected_country}`).style("fill", "#87004f");
            })
            .on("mouseout", function () {
                atooltip_wrapper_01.style("opacity", 0).style("visibility", "hidden");

                // select path
                d3.selectAll(`.dream-orig-area-chart-01`).style("fill", dream_area_s_col);
            });
    };
    //=====< 4. Dream Destination Area Chart >=====================================================>
    //=============================================================================================>
    //=============================================================================================>
    //=============================================================================================>
    let dream_dest_area_chart_fun_01 = function (selected_country_iso) {
        dream_dest_area_data_01 = migrants_data.filter((d) => d.dest_iso == selected_country_iso && d.dream_dest_migrants_avg > 0);

        dream_dest_area_data_01 = dream_dest_area_data_01.sort(dream_dest_sort_01);

        dream_dest_area_countries_01 = d3
            .flatGroup(
                dream_dest_area_data_01,
                (d) => d.orig,
                (d) => d.orig_iso
            )
            .map(function (d, i) {
                return {
                    country: d[0],
                    country_iso: d[1],
                    country_data: d[2],
                };
            })
            .map(function (d, i) {
                return d.country;
            });

        dream_dest_area_countries_iso_01 = d3
            .flatGroup(
                dream_dest_area_data_01,
                (d) => d.orig,
                (d) => d.orig_iso
            )
            .map(function (d, i) {
                return {
                    country: d[0],
                    country_iso: d[1],
                    country_data: d[2],
                };
            })
            .map(function (d, i) {
                return d.country_iso;
            });

        // countries serial
        dream_dest_area_countries_n_01 = d3.range(0, dream_dest_area_countries_01.length, 1);

        // stack data
        dream_dest_area_data_stack_01 = d3.group(dream_dest_area_data_01, (d) => d.year);

        // d3.stack
        dream_dest_area_data_stack_conv_01 = d3
            .stack()
            .keys(dream_dest_area_countries_n_01)
            .value((d, key) => d[1][key].dream_dest_migrants)(dream_dest_area_data_stack_01);

        // Chart Scales -----------------------------------------------------------------------------------
        dream_dest_y_01 = d3
            .scaleLinear()
            .domain([0, 100])
            .range([height_01 / 2 + 25, height_01]);

        // color scale
        dream_dest_color_01 = d3
            .scaleLinear()
            .domain([0, dream_dest_area_countries_01.length - 1])
            .range([0.8, 0.2]);

        // Area Chart -------------------------------------------------------------------------------------
        dream_dest_area_chart_01 = dream_dest_svg_01_real_dream
            .selectAll("path.dream-dest-area-chart-01")
            .data(dream_dest_area_data_stack_conv_01)
            .join("path")
            .attr("class", (d, i) => `dream-dest-area-chart-01 ${dream_dest_area_countries_iso_01[i]}`)
            .style("fill-opacity", (d, i) => dream_dest_color_01(i) - 0.05)
            .style("stroke-opacity", (d, i) => dream_dest_color_01(i) + 0.2)
            .style("stroke-width", (d, i) => dream_dest_color_01(i) + 0.1)
            .style("fill", (d, i) => dream_area_s_col)
            .style("stroke", (d, i) => dream_area_s_col)
            .attr(
                "d",
                d3
                    .area()
                    .x((d, i) => dream_dest_x_01(d.data[0]))
                    .y0((d) => dream_dest_y_01(d[0] * dest_d_f_01))
                    .y1((d) => dream_dest_y_01(d[1] * dest_d_f_01))
                    .curve(d3.curveBasis)
            );

        let dream_dest_area_chart_up_01 = d3.selectAll("path.dream-dest-area-chart-01").data(dream_dest_area_data_stack_conv_01);
        dream_dest_area_chart_up_01.exit().remove();
        dream_dest_area_chart_up_01
            .join("path")
            .attr("class", (d, i) => `dream-dest-area-chart-01 ${dream_dest_area_countries_iso_01[i]}`)
            .style("fill-opacity", (d, i) => dream_dest_color_01(i) - 0.05)
            .style("stroke-opacity", (d, i) => dream_dest_color_01(i) + 0.3)
            .style("stroke-width", (d, i) => dream_dest_color_01(i) + 0.3)
            .attr(
                "d",
                d3
                    .area()
                    .x((d, i) => dream_dest_x_01(d.data[0]))
                    .y0((d) => dream_dest_y_01(d[0] * dest_d_f_01))
                    .y1((d) => dream_dest_y_01(d[1] * dest_d_f_01))
                    .curve(d3.curveBasis)
            );

        dream_dest_area_chart_txt_01 = dream_dest_svg_01_real_dream
            .selectAll("text.dream-dest-area-chart-01-txt")
            .data(dream_dest_area_data_stack_conv_01)
            .join("text")
            .attr("class", (d, i) => `dream-dest-area-chart-01-txt`)
            .style("text-align", "center")
            .style("text-anchor", "middle")
            .style("alignment-baseline", "middle")
            .style("font-size", "10px")
            .text((d, i) => (d[7].data[1][i].dream_dest_migrants_avg * dest_d_f_01 > 20 ? d[7].data[1][i].orig : ""))
            .attr("x", (d, i) => dream_dest_x_01(2012.5))
            .attr("y", (d, i) => dream_dest_y_01(d[7][0] + ((d[7][1] - d[7][0]) / 2) * dest_d_f_01))
            .style("fill", dream_txt_col);

        dream_dest_area_chart_01
            .on("mousemove", function () {
                atooltip_wrapper_01.style("opacity", 1).style("visibility", "visible");

                // get secondary class
                let selected_country = d3.select(this).attr("class").split(" ")[1];
                let el_box = d3.select(this).node().getBBox();
                let x_country = el_box.x + el_box.width / 2;
                // x_country = event.clientX;
                let y_country = el_box.y + el_box.height / 2 - 10;
                // y_country = event.clientY;

                atooltip_country_01.text(iso_country_fun(selected_country));

                let maxSize = document.getElementById("atooltip_country_01").getComputedTextLength();

                atooltip_background_01
                    .transition()
                    .duration(100)
                    .attr("x", -0.5 * maxSize * 1.6)
                    .attr("width", maxSize * 1.6);

                atooltip_wrapper_01
                    .transition()
                    .duration(100)
                    .attr("transform", "translate(" + (x_country - maxSize * 0.5) + "," + y_country + ")")
                    .style("opacity", 1);

                // select path
                d3.select(`.dream-dest-area-chart-01.${selected_country}`).style("fill", "#87004f");
            })
            .on("mouseout", function () {
                atooltip_wrapper_01.style("opacity", 0).style("visibility", "hidden");

                // select path
                d3.selectAll(`.dream-dest-area-chart-01`).style("fill", dream_area_s_col);
            });
    };

    // svg_01_real_dream
    //=====< 5. Area Chart Lines & Axes >==========================================================>
    //=============================================================================================>
    //=============================================================================================>
    //=============================================================================================>
    // Chart Lines ---------------------------------------------------------------------------------
    // Lines
    const overlay_lines_01 = svg_01
        .selectAll("line.overlay-lines")
        .data([0, width_01 / 2 - 30, width_01 / 2 + 30, width_01])
        .join("line")
        .style("stroke", background_col)
        .style("stroke-width", 2)
        .attr("x1", (d) => d)
        .attr("y1", -20)
        .attr("x2", (d) => d)
        .attr("y2", height_01 + 20);
    // Chart Axes ----------------------------------------------------------------------------------
    // x-axis
    const real_area_x_axis_01 = svg_01
        .selectAll("text.real-area-x-axis-01")
        .data([2005, 2010, 2015, 2020])
        .join("text")
        .attr("class", (d, i) => `real-area-x-axis-01`)
        .style("text-align", "center")
        .style("text-anchor", "middle")
        .style("alignment-baseline", "middle")
        .style("font-size", "10px")
        .style("opacity", 0.7)
        .text((d, i) => d)
        .attr("x", (d, i) => real_orig_x_01(d))
        .attr("y", height_01 - 10)
        .style("fill", "grey");

    d3.select("text.real-area-x-axis-01").style("text-anchor", "start");
    d3.select(d3.selectAll("text.real-area-x-axis-01").nodes().reverse()[0]).style("text-anchor", "end");

    const dream_area_x_axis_01 = svg_01
        .selectAll("text.dream-area-x-axis-01")
        .data([2005, 2010, 2015, 2020])
        .join("text")
        .attr("class", (d, i) => `dream-area-x-axis-01`)
        .style("text-align", "center")
        .style("text-anchor", "middle")
        .style("alignment-baseline", "middle")
        .style("font-size", "10px")
        .style("opacity", 0.7)
        .text((d, i) => d)
        .attr("x", (d, i) => dream_orig_x_01(d))
        .attr("y", height_01 - 10)
        .style("fill", "grey");

    d3.select("text.dream-area-x-axis-01").style("text-anchor", "start");
    d3.select(d3.selectAll("text.dream-area-x-axis-01").nodes().reverse()[0]).style("text-anchor", "end");

    // y-axis
    real_orig_y_01 = d3
        .scaleLinear()
        .domain([0, 100])
        .range([height_01 - 25, 70]);

    dream_orig_y_01 = d3
        .scaleLinear()
        .domain([0, 100])
        .range([height_01 - 25, 70]);

    const out_area_y_axis_01 = svg_01
        .selectAll("text.out-area-y-axis")
        .data([0, 25, 50, 75, 100])
        .join("text")
        .attr("class", (d, i) => `out-area-y-axis`)
        .style("text-align", "center")
        .style("text-anchor", "middle")
        .style("alignment-baseline", "middle")
        .style("font-size", "10px")
        .style("opacity", 0.7)
        .text((d, i) => `- ${d}% -`)
        .attr("x", width_01 / 2)
        .attr("y", (d, i) => real_orig_y_01(d))
        .style("fill", "grey");

    // y-axis
    real_dest_y_01 = d3
        .scaleLinear()
        .domain([0, 100])
        .range([height_01 + 25, height_01]);

    dream_dest_y_01 = d3
        .scaleLinear()
        .domain([0, 100])
        .range([height_01 + 25, height_01]);

    // const in_area_y_axis = svg_01_real_dream
    //     .selectAll("text.in-area-y-axis")
    //     .data([0, 25, 50, 75, 100])
    //     .join("text")
    //     .attr("class", (d, i) => `in-area-y-axis`)
    //     .style("text-align", "center")
    //     .style("text-anchor", "middle")
    //     .style("alignment-baseline", "middle")
    //     .style("font-size", "10px")
    //     .style("opacity", 0.7)
    //     .text((d, i) => `- ${d}% -`)
    //     .attr("x", width_01 / 2)
    //     .attr("y", (d, i) => real_dest_y(d))
    //     .style("fill", "grey");

    // annotations
    const area_annotation_01 = svg_01
        .append("g")
        .attr("class", (d, i) => `area-annotation`)
        .style("text-align", "center")
        .style("text-anchor", "middle")
        .style("alignment-baseline", "middle")
        .style("font-size", "14px")
        .style("opacity", 0.9)
        .style("fill", "grey")
        .each(function () {
            d3.select(this)
                .append("text")
                .attr("x", real_orig_x_01(2012.5))
                .attr("y", real_orig_y_01(145))
                .text("Reality")
                .style("font-size", "20px")
                .style("fill", real_area_s_col);

            d3.select(this).append("text").attr("x", real_orig_x_01(2012.5)).attr("y", real_orig_y_01(138)).text("Migrant's real flow");

            d3.select(this)
                .append("text")
                .attr("x", real_orig_x_01(2012.5))
                .attr("y", real_orig_y_01(138) + 20)
                .text("out of the country");

            // d3.select(this)
            //     .append("text")
            //     .attr("x", real_dest_x(2012.5))
            //     .attr("y", real_dest_y(130) - 20)
            //     .text("Migrant's real flow");

            // d3.select(this).append("text").attr("x", real_dest_x(2012.5)).attr("y", real_dest_y(130)).text("into the country");
            d3.select(this)
                .append("text")
                .attr("x", dream_orig_x_01(2012.5))
                .attr("y", dream_orig_y_01(145))
                .text("Dream")
                .style("font-size", "20px")
                .style("fill", dream_area_s_col);

            d3.select(this).append("text").attr("x", dream_orig_x_01(2012.5)).attr("y", dream_orig_y_01(138)).text("Migrant's dream flow");

            d3.select(this)
                .append("text")
                .attr("x", dream_orig_x_01(2012.5))
                .attr("y", dream_orig_y_01(138) + 20)
                .text("out of the country");

            // d3.select(this)
            //     .append("text")
            //     .attr("x", dream_dest_x(2012.5))
            //     .attr("y", dream_dest_y(130) - 20)
            //     .text("Migrant's dream flow");

            // d3.select(this).append("text").attr("x", dream_dest_x(2012.5)).attr("y", dream_dest_y(130)).text("into the country");

            // countries
            d3.select(this)
                .append("text")
                .attr("x", real_orig_x_01(2012.5))
                .attr("y", real_orig_y_01(93))
                .style("font-size", "10px")
                .style("fill", real_txt_col)
                .text("Saudi Arabia");

            d3.select(this)
                .append("text")
                .attr("x", real_orig_x_01(2012.5))
                .attr("y", real_orig_y_01(101))
                .style("font-size", "10px")
                .style("fill", real_txt_col)
                .text("Turkey");

            d3.select(this)
                .append("text")
                .attr("x", dream_orig_x_01(2012.5))
                .attr("y", dream_orig_y_01(14))
                .style("font-size", "10px")
                .style("fill", dream_txt_col)
                .text("Germany");

            d3.select(this)
                .append("text")
                .attr("x", dream_orig_x_01(2014))
                .attr("y", dream_orig_y_01(21))
                .style("font-size", "10px")
                .style("fill", dream_txt_col)
                .text("Canada");

            d3.select(this)
                .append("text")
                .attr("x", dream_orig_x_01(2012.5))
                .attr("y", dream_orig_y_01(29))
                .style("font-size", "10px")
                .style("fill", dream_txt_col)
                .text("Australia");

            d3.select(this)
                .append("text")
                .attr("x", width_01 / 2)
                .attr("y", -95)
                .style("font-size", "16px")
                .style("fill", "#6e6e6e")
                .text("Afghanistan");

            d3.select(this)
                .append("text")
                .attr("x", width_01 / 2)
                .attr("y", -78)
                .style("font-size", "12px")
                .style("fill", "#6e6e6e")
                .style("opacity", 0.9)
                .text("Y2020");

            d3.select(this)
                .append("line")
                .attr("x1", width_01 / 2 - 120)
                .attr("y1", -70)
                .attr("x2", width_01 / 2 + 120)
                .attr("y2", -70)
                .style("stroke", "white")
                .style("stroke-dasharray", "3 3")
                .style("stroke-width", 0.5);

            d3.select(this)
                .append("circle")
                .attr("cx", width_01 / 2 - 120)
                .attr("cy", -70)
                .attr("r", 3)
                .style("fill", "#6e6e6e");

            d3.select(this)
                .append("circle")
                .attr("cx", width_01 / 2 + 120)
                .attr("cy", -70)
                .attr("r", 3)
                .style("fill", "#6e6e6e");

            d3.select(this)
                .append("text")
                .attr("x", width_01 / 2)
                .attr("y", -53)
                .style("font-size", "12px")
                .style("fill", "#6e6e6e")
                .text("Migrants in: 0 | Migrants out: 5.9m");
        });

    atooltip_wrapper_01.raise();

    //
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // 00. dropdown ///////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Initial Setting
    // d3.select("#myInput");
    const iso_c = "AFG";
    real_orig_area_chart_fun_01(iso_c);
    real_dest_area_chart_fun_01(iso_c);
    dream_orig_area_chart_fun_01(iso_c);
    dream_dest_area_chart_fun_01(iso_c);
}; // end of dataviz_01

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 02. SVG_02  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Dimensions
let dimensions_02 = {
    width: window.innerWidth * 0.95,
    height: window.innerHeight * 0.9,
    margin: {
        top: 120,
        right: 100,
        bottom: 120,
        left: 100,
    },
};

//Define drawing area within "dimensions" object
dimensions_02.vizboardWidth = dimensions_02.width - dimensions_02.margin.left - dimensions_02.margin.right;
dimensions_02.vizboardHeight = dimensions_02.height - dimensions_02.margin.top - dimensions_02.margin.bottom;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Draw SVG
const vizboard_width_02 = 1200;
const vizboard_height_02 = 900;

let svg_vizboard_02 = d3
    .select("#svg-vizboard-02")
    .append("svg")
    .classed("svg-vizboard-02", true)
    .attr("viewBox", `0 0 ${vizboard_width_02} ${vizboard_height_02}`)
    .attr("preserveAspectRatio", "xMinYMin meet");
// .style("border", "1px dashed pink");

svg_02 = svg_vizboard_02.append("g").style("transform", `translate(${dimensions_02.margin.left}px, ${dimensions_02.margin.top}px)`);

// Create SVG dimensions
const width_02 = vizboard_width_02 - dimensions_02.margin.left - dimensions_02.margin.right;
const height_02 = vizboard_height_02 - dimensions_02.margin.top - dimensions_02.margin.bottom;

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 01. dataviz_02 /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const dataviz_02 = function () {
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Nested Data ////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //=====< Origin Data >=========================================================>
    //====== https://observablehq.com/@d3/d3-flatgroup

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Scales  ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Interaction Settings ///////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //=====< Setup >===============================================================================>
    //=============================================================================================>
    //=====< Map's Circles Location Function >=====================================================>
    let get_cxy = function (iso) {
        let x = d3.select(`#${iso}`).attr("cx");
        let y = d3.select(`#${iso}`).attr("cy");
        return { cx: x, cy: y };
    };

    //=====< Iso to Serial Function >==============================================================>
    let iso_serial_fun = function (x) {
        let iso_serial = d3
            .flatGroup(
                migrants_avg_data,
                (d) => d.country_iso,
                (d) => d.serial
            )
            .map((d, i) => {
                return {
                    iso: d[0],
                    serial: d[1],
                };
            })
            .filter((d) => d.iso == x)[0].serial;
        return iso_serial - 1;
    };

    //=====< Iso to Name Function >==============================================================>
    let iso_country_fun = function (x) {
        let iso_name = migrants_avg_data.filter((d) => d.country_iso == x)[0].country;
        return iso_name;
    };
    //=====< Iso to Name Function >==============================================================>
    let country_iso_fun = function (x) {
        let iso_name = migrants_avg_data.filter((d) => d.country == x)[0].country_iso;
        return iso_name;
    };

    // console.log(country_iso_fun("Egypt"));
    //=====< Sum Function >=======================================================================>
    let iso_sum_fun = function (iso) {
        return migrants_sum_data.filter((d) => d.country_iso == iso)[0];
    };

    //=====< Setup >===============================================================================>
    let year_x = 2020;
    let t_sec = 700;

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Area Chart  ////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const real_orig_svg_02_real_dream = svg_02.append("g");
    const real_dest_svg_02_real_dream = svg_02.append("g");
    const dream_orig_svg_02_real_dream = svg_02.append("g");
    const dream_dest_svg_02_real_dream = svg_02.append("g");

    // svg_02_real_dream.style("visibility", "hidden");

    // let country_name = "Egypt";
    // let selected_country_iso = country_iso_fun(country_name);

    // sorting functions
    let real_orig_sort_02 = function (a, b) {
        return b.real_orig_migrants_avg - a.real_orig_migrants_avg;
    };

    let real_dest_sort_02 = function (a, b) {
        return b.real_dest_migrants_avg - a.real_dest_migrants_avg;
    };

    let dream_orig_sort_02 = function (a, b) {
        return b.dream_orig_migrants_avg - a.dream_orig_migrants_avg;
    };

    let dream_dest_sort_02 = function (a, b) {
        return b.dream_dest_migrants_avg - a.dream_dest_migrants_avg;
    };

    // General letiables
    let orig_orig_real_02;
    let orig_orig_dream_02;
    let orig_dest_real_02;
    let orig_dest_dream_02;

    let orig_r_f_02;
    let orig_d_f_02;
    let dest_r_f_02;
    let dest_d_f_02;

    let area_opacity_02 = d3.scaleLinear().domain([0, 100]).range([0.01, 0.4]);

    let real_orig_x_02 = d3
        .scaleLinear()
        .domain([2005, 2020])
        .range([0, width_02 / 2 - 30]);
    let real_dest_x_02 = d3
        .scaleLinear()
        .domain([2005, 2020])
        .range([0, width_02 / 2 - 30]);
    let dream_orig_x_02 = d3
        .scaleLinear()
        .domain([2005, 2020])
        .range([width_02 / 2 + 30, width_02]);
    let dream_dest_x_02 = d3
        .scaleLinear()
        .domain([2005, 2020])
        .range([width_02 / 2 + 30, width_02]);

    // Real Origin letiables
    let real_orig_area_data_02;
    let real_dest_area_data_02;
    let dream_orig_area_data_02;
    let dream_dest_area_data_02;

    let real_orig_area_countries_02;
    let real_dest_area_countries_02;
    let dream_orig_area_countries_02;
    let dream_dest_area_countries_02;

    let real_orig_area_countries_iso_02;
    let real_dest_area_countries_iso_02;
    let dream_orig_area_countries_iso_02;
    let dream_dest_area_countries_iso_02;

    let real_orig_area_countries_n_02;
    let real_dest_area_countries_n_02;
    let dream_orig_area_countries_n_02;
    let dream_dest_area_countries_n_02;

    let real_orig_area_data_stack_02;
    let real_dest_area_data_stack_02;
    let dream_orig_area_data_stack_02;
    let dream_dest_area_data_stack_02;

    let real_orig_area_data_stack_conv_02;
    let real_dest_area_data_stack_conv_02;
    let dream_orig_area_data_stack_conv_02;
    let dream_dest_area_data_stack_conv_02;

    let real_orig_y_02;
    let real_dest_y_02;
    let dream_orig_y_02;
    let dream_dest_y_02;

    let real_orig_color_02;
    let real_dest_color_02;
    let dream_orig_color_02;
    let dream_dest_color_02;

    let real_orig_area_chart_02;
    let real_dest_area_chart_02;
    let dream_orig_area_chart_02;
    let dream_dest_area_chart_02;

    let real_orig_area_chart_txt_02;
    let real_dest_area_chart_txt_02;
    let dream_orig_area_chart_txt_02;
    let dream_dest_area_chart_txt_02;
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Tooltip  ///////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    let atooltip_wrapper_02 = svg_02
        .append("g")
        .attr("class", "atooltip-wrapper-02")
        .attr("transform", "translate(" + 0 + "," + 0 + ")")
        .style("font-size", `12px`)
        .style("opacity", 1);

    let atooltip_background_02 = atooltip_wrapper_02
        .append("rect")
        .attr("class", "atooltip-background-02")
        .attr("x", 0)
        .attr("y", 13)
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("width", 0)
        .attr("height", 26)
        .style("opacity", 0.8)
        .style("fill", background_col);

    let atooltip_country_02 = atooltip_wrapper_02
        .append("text")
        .attr("class", "atooltip-country-02")
        .attr("id", "atooltip_country_02")
        .style("text-align", "center")
        .style("text-anchor", "middle")
        .style("alignment-baseline", "middle")
        .attr("y", 27)
        .style("fill", "#adadad")
        .text("");

    //=====< 1. Real Origin Area Chart >===========================================================>
    //=============================================================================================>
    //=============================================================================================>
    //=============================================================================================>

    let real_orig_area_chart_fun_02 = function (selected_country_iso) {
        real_orig_area_data_02 = migrants_data.filter((d) => d.orig_iso == selected_country_iso && d.real_orig_migrants_avg > 0);

        real_orig_area_data_02 = real_orig_area_data_02.sort(real_orig_sort_02);

        orig_orig_real_02 = real_orig_area_data_02[0].orig_real_fact;
        orig_orig_dream_02 = real_orig_area_data_02[0].orig_dream_fact;
        orig_dest_real_02 = real_orig_area_data_02[0].orig_real_fact;
        orig_dest_dream_02 = real_orig_area_data_02[0].orig_dream_fact;

        orig_r_f_02 = orig_orig_real_02;
        orig_d_f_02 = orig_orig_dream_02;
        dest_r_f_02 = orig_dest_real_02;
        dest_d_f_02 = orig_dest_dream_02;

        // console.log(orig_orig_real, orig_orig_dream, orig_dest_real, orig_dest_dream);
        console.log(orig_r_f_02, orig_d_f_02, dest_r_f_02, dest_d_f_02);
        // console.log(orig_orig_real, orig_orig_dream);
        // console.log(orig_r_f, orig_d_f);

        real_orig_area_countries_02 = d3
            .flatGroup(
                real_orig_area_data_02,
                (d) => d.dest,
                (d) => d.dest_iso
            )
            .map(function (d, i) {
                return {
                    country: d[0],
                    country_iso: d[1],
                    country_data: d[2],
                };
            })
            .map(function (d, i) {
                return d.country;
            });

        real_orig_area_countries_iso_02 = d3
            .flatGroup(
                real_orig_area_data_02,
                (d) => d.dest,
                (d) => d.dest_iso
            )
            .map(function (d, i) {
                return {
                    country: d[0],
                    country_iso: d[1],
                    country_data: d[2],
                };
            })
            .map(function (d, i) {
                return d.country_iso;
            });

        // console.log(real_orig_area_countries_iso);

        // countries serial
        real_orig_area_countries_n_02 = d3.range(0, real_orig_area_countries_02.length, 1);
        // console.log(real_orig_area_countries_n);

        // stack data
        real_orig_area_data_stack_02 = d3.group(real_orig_area_data_02, (d) => d.year);

        // console.log(real_orig_area_data_stack);

        // d3.stack
        real_orig_area_data_stack_conv_02 = d3
            .stack()
            .keys(real_orig_area_countries_n_02)
            .value((d, key) => d[1][key].real_orig_migrants)(real_orig_area_data_stack_02);

        // console.log(real_orig_area_data_stack_conv);

        // Chart Scales -----------------------------------------------------------------------------------
        // real_orig_y = d3
        //     .scaleLinear()
        //     .domain([0, 100])
        //     .range([height_02 / 2 - 25, 0]);

        real_orig_y_02 = d3
            .scaleLinear()
            .domain([0, 100])
            .range([height_02 / 2 - 25, 70]);

        // color scale
        real_orig_color_02 = d3
            .scaleLinear()
            .domain([0, real_orig_area_countries_02.length - 1])
            .range([0.8, 0.2]);

        // Area Chart -------------------------------------------------------------------------------------
        real_orig_area_chart_02 = real_orig_svg_02_real_dream
            .selectAll("path.real-orig-area-chart-02")
            .data(real_orig_area_data_stack_conv_02)
            .join("path")
            .attr("class", (d, i) => `real-orig-area-chart-02 ${real_orig_area_countries_iso_02[i]}`)
            .style("fill-opacity", (d, i) => real_orig_color_02(i) - 0.05)
            .style("stroke-opacity", (d, i) => real_orig_color_02(i) + 0.2)
            .style("stroke-width", (d, i) => real_orig_color_02(i) + 0.1)
            .style("fill", (d, i) => real_area_s_col)
            .style("stroke", (d, i) => real_area_s_col)
            .attr(
                "d",
                d3
                    .area()
                    .x((d, i) => real_orig_x_02(d.data[0]))
                    .y0((d) => real_orig_y_02(d[0] * orig_r_f_02))
                    .y1((d) => real_orig_y_02(d[1] * orig_r_f_02))
                    .curve(d3.curveBasis)
            );

        let real_orig_area_chart_up_02 = d3.selectAll("path.real-orig-area-chart-02").data(real_orig_area_data_stack_conv_02);
        real_orig_area_chart_up_02.exit().remove();
        real_orig_area_chart_up_02
            .join("path")
            .attr("class", (d, i) => `real-orig-area-chart-02 ${real_orig_area_countries_iso_02[i]}`)
            .style("fill-opacity", (d, i) => real_orig_color_02(i) - 0.05)
            .style("stroke-opacity", (d, i) => real_orig_color_02(i) + 0.3)
            .style("stroke-width", (d, i) => real_orig_color_02(i) + 0.3)
            .attr(
                "d",
                d3
                    .area()
                    .x((d, i) => real_orig_x_02(d.data[0]))
                    .y0((d) => real_orig_y_02(d[0] * orig_r_f_02))
                    .y1((d) => real_orig_y_02(d[1] * orig_r_f_02))
                    .curve(d3.curveBasis)
            );

        real_orig_area_chart_txt_02 = real_orig_svg_02_real_dream
            .selectAll("text.real-orig-area-chart-02-txt")
            .data(real_orig_area_data_stack_conv_02)
            .join("text")
            .attr("class", (d, i) => `real-orig-area-chart-02-txt`)
            .style("text-align", "center")
            .style("text-anchor", "middle")
            .style("alignment-baseline", "middle")
            .style("font-size", "10px")
            .text((d, i) => (d[7].data[1][i].real_orig_migrants_avg * orig_r_f_02 > 20 ? d[7].data[1][i].dest : ""))
            .attr("x", (d, i) => real_orig_x_02(2012.5))
            .attr("y", (d, i) => real_orig_y_02(d[7][0] + ((d[7][1] - d[7][0]) / 2) * orig_r_f_02))
            .style("fill", real_txt_col);

        real_orig_area_chart_02
            .on("mousemove", function () {
                atooltip_wrapper_02.style("opacity", 1).style("visibility", "visible");

                // get secondary class
                let selected_country = d3.select(this).attr("class").split(" ")[1];
                let el_box = d3.select(this).node().getBBox();
                let x_country = el_box.x + el_box.width / 2;
                // x_country = event.clientX;
                let y_country = el_box.y + el_box.height / 2 - 10;
                // y_country = event.clientY;

                atooltip_country_02.text(iso_country_fun(selected_country));

                let maxSize = document.getElementById("atooltip_country_02").getComputedTextLength();

                atooltip_background_02
                    .transition()
                    .duration(100)
                    .attr("x", -0.5 * maxSize * 1.6)
                    .attr("width", maxSize * 1.6);

                atooltip_wrapper_02
                    .transition()
                    .duration(100)
                    .attr("transform", "translate(" + (x_country - maxSize * 0.5) + "," + y_country + ")")
                    .style("opacity", 1);

                // select path
                d3.select(`.real-orig-area-chart-02.${selected_country}`).style("fill", "#008a77");
            })
            .on("mouseout", function () {
                atooltip_wrapper_02.style("opacity", 0).style("visibility", "hidden");

                // select path
                d3.selectAll(`.real-orig-area-chart-02`).style("fill", real_area_s_col);
            });
    };
    //=====< 2. Real Destination Area Chart >======================================================>
    //=============================================================================================>
    //=============================================================================================>
    //=============================================================================================>
    let real_dest_area_chart_fun_02 = function (selected_country_iso) {
        real_dest_area_data_02 = migrants_data.filter((d) => d.dest_iso == selected_country_iso && d.real_dest_migrants_avg > 0);
        // console.log(real_dest_area_data);

        real_dest_area_data_02 = real_dest_area_data_02.sort(real_dest_sort_02);

        real_dest_area_countries_02 = d3
            .flatGroup(
                real_dest_area_data_02,
                (d) => d.orig,
                (d) => d.orig_iso
            )
            .map(function (d, i) {
                return {
                    country: d[0],
                    country_iso: d[1],
                    country_data: d[2],
                };
            })
            .map(function (d, i) {
                return d.country;
            });

        real_dest_area_countries_iso_02 = d3
            .flatGroup(
                real_dest_area_data_02,
                (d) => d.orig,
                (d) => d.orig_iso
            )
            .map(function (d, i) {
                return {
                    country: d[0],
                    country_iso: d[1],
                    country_data: d[2],
                };
            })
            .map(function (d, i) {
                return d.country_iso;
            });

        // countries serial
        real_dest_area_countries_n_02 = d3.range(0, real_dest_area_countries_02.length, 1);

        // stack data
        real_dest_area_data_stack_02 = d3.group(real_dest_area_data_02, (d) => d.year);

        // d3.stack
        real_dest_area_data_stack_conv_02 = d3
            .stack()
            .keys(real_dest_area_countries_n_02)
            .value((d, key) => d[1][key].real_dest_migrants)(real_dest_area_data_stack_02);

        // Chart Scales -----------------------------------------------------------------------------------
        real_dest_y_02 = d3
            .scaleLinear()
            .domain([0, 100])
            .range([height_02 / 2 + 25, height_02 - 70]);

        // color scale
        real_dest_color_02 = d3
            .scaleLinear()
            .domain([0, real_dest_area_countries_02.length - 1])
            .range([0.8, 0.2]);

        // Area Chart -------------------------------------------------------------------------------------
        real_dest_area_chart_02 = real_dest_svg_02_real_dream
            .selectAll("path.real-dest-area-chart-02")
            .data(real_dest_area_data_stack_conv_02)
            .join("path")
            .attr("class", (d, i) => `real-dest-area-chart-02 ${real_dest_area_countries_iso_02[i]}`)
            .style("fill-opacity", (d, i) => real_dest_color_02(i) - 0.05)
            .style("stroke-opacity", (d, i) => real_dest_color_02(i) + 0.2)
            .style("stroke-width", (d, i) => real_dest_color_02(i) + 0.1)

            .style("fill", (d, i) => real_area_s_col)
            .style("stroke", (d, i) => real_area_s_col)
            .attr(
                "d",
                d3
                    .area()
                    .x((d, i) => real_dest_x_02(d.data[0]))
                    .y0((d) => real_dest_y_02(d[0] * dest_r_f_02))
                    .y1((d) => real_dest_y_02(d[1] * dest_r_f_02))
                    .curve(d3.curveBasis)
            );

        let real_dest_area_chart_up_02 = d3.selectAll("path.real-dest-area-chart-02").data(real_dest_area_data_stack_conv_02);
        real_dest_area_chart_up_02.exit().remove();
        real_dest_area_chart_up_02
            .join("path")
            .attr("class", (d, i) => `real-dest-area-chart-02 ${real_dest_area_countries_iso_02[i]}`)
            .style("fill-opacity", (d, i) => real_dest_color_02(i) - 0.05)
            .style("stroke-opacity", (d, i) => real_dest_color_02(i) + 0.3)
            .style("stroke-width", (d, i) => real_dest_color_02(i) + 0.3)
            .attr(
                "d",
                d3
                    .area()
                    .x((d, i) => real_dest_x_02(d.data[0]))
                    .y0((d) => real_dest_y_02(d[0] * dest_r_f_02))
                    .y1((d) => real_dest_y_02(d[1] * dest_r_f_02))
                    .curve(d3.curveBasis)
            );

        let real_dest_area_chart_txt_02 = real_dest_svg_02_real_dream
            .selectAll("text.real-dest-area-chart-02-txt")
            .data(real_dest_area_data_stack_conv_02)
            .join("text")
            .attr("class", (d, i) => `real-dest-area-chart-02-txt`)
            .style("text-align", "center")
            .style("text-anchor", "middle")
            .style("alignment-baseline", "middle")
            .style("font-size", "10px")
            .text((d, i) => (d[7].data[1][i].real_dest_migrants_avg * dest_r_f_02 > 15 ? d[7].data[1][i].orig : ""))
            .attr("x", (d, i) => real_dest_x_02(2012.5))
            .attr("y", (d, i) => real_dest_y_02(d[7][0] + ((d[7][1] - d[7][0]) / 2) * dest_r_f_02))
            .style("fill", real_txt_col);

        real_dest_area_chart_02
            .on("mouseover", function () {
                atooltip_wrapper_02.style("opacity", 1).style("visibility", "visible");

                // get secondary class
                let selected_country = d3.select(this).attr("class").split(" ")[1];
                let el_box = d3.select(this).node().getBBox();
                let x_country = el_box.x + el_box.width / 2;
                // x_country = event.clientX;
                let y_country = el_box.y + el_box.height / 2 - 10;
                // y_country = event.clientY;

                atooltip_country_02.text(iso_country_fun(selected_country));

                let maxSize = document.getElementById("atooltip_country_02").getComputedTextLength();

                atooltip_background_02
                    .transition()
                    .duration(100)
                    .attr("x", -0.5 * maxSize * 1.6)
                    .attr("width", maxSize * 1.6);

                atooltip_wrapper_02
                    .transition()
                    .duration(100)
                    .attr("transform", "translate(" + (x_country - maxSize * 0.5) + "," + y_country + ")")
                    .style("opacity", 1);

                // select path
                d3.select(`.real-dest-area-chart-02.${selected_country}`).style("fill", "#008a77");
            })
            .on("mouseout", function () {
                atooltip_wrapper_02.style("opacity", 0).style("visibility", "hidden");

                // select path
                d3.selectAll(`.real-dest-area-chart-02`).style("fill", real_area_s_col);
            });
    };
    //=====< 3. Dream Origin Area Chart >==========================================================>
    //=============================================================================================>
    //=============================================================================================>
    //=============================================================================================>

    let dream_orig_area_chart_fun_02 = function (selected_country_iso) {
        dream_orig_area_data_02 = migrants_data.filter((d) => d.orig_iso == selected_country_iso && d.dream_orig_migrants_avg > 0);

        dream_orig_area_data_02 = dream_orig_area_data_02.sort(dream_orig_sort_02);

        dream_orig_area_countries_02 = d3
            .flatGroup(
                dream_orig_area_data_02,
                (d) => d.dest,
                (d) => d.dest_iso
            )
            .map(function (d, i) {
                return {
                    country: d[0],
                    country_iso: d[1],
                    country_data: d[2],
                };
            })
            .map(function (d, i) {
                return d.country;
            });

        dream_orig_area_countries_iso_02 = d3
            .flatGroup(
                dream_orig_area_data_02,
                (d) => d.dest,
                (d) => d.dest_iso
            )
            .map(function (d, i) {
                return {
                    country: d[0],
                    country_iso: d[1],
                    country_data: d[2],
                };
            })
            .map(function (d, i) {
                return d.country_iso;
            });

        // console.log(real_orig_area_countries_iso);

        // countries serial
        dream_orig_area_countries_n_02 = d3.range(0, dream_orig_area_countries_02.length, 1);
        // console.log(real_orig_area_countries_n);

        // stack data
        dream_orig_area_data_stack_02 = d3.group(dream_orig_area_data_02, (d) => d.year);

        // console.log(real_orig_area_data_stack);

        // d3.stack
        dream_orig_area_data_stack_conv_02 = d3
            .stack()
            .keys(dream_orig_area_countries_n_02)
            .value((d, key) => d[1][key].dream_orig_migrants)(dream_orig_area_data_stack_02);

        // console.log(real_orig_area_data_stack_conv);

        // Chart Scales -----------------------------------------------------------------------------------
        dream_orig_y_02 = d3
            .scaleLinear()
            .domain([0, 100])
            .range([height_02 / 2 - 25, 70]);

        // color scale
        dream_orig_color_02 = d3
            .scaleLinear()
            .domain([0, dream_orig_area_countries_02.length - 1])
            .range([0.8, 0.2]);

        // Area Chart -------------------------------------------------------------------------------------
        dream_orig_area_chart_02 = dream_orig_svg_02_real_dream
            .selectAll("path.dream-orig-area-chart-02")
            .data(dream_orig_area_data_stack_conv_02)
            .join("path")
            .attr("class", (d, i) => `dream-orig-area-chart-02 ${dream_orig_area_countries_iso_02[i]}`)
            .style("fill-opacity", (d, i) => dream_orig_color_02(i) - 0.05)
            .style("stroke-opacity", (d, i) => dream_orig_color_02(i) + 0.2)
            .style("stroke-width", (d, i) => dream_orig_color_02(i) + 0.1)
            .style("fill", (d, i) => dream_area_s_col)
            .style("stroke", (d, i) => dream_area_s_col)
            .attr(
                "d",
                d3
                    .area()
                    .x((d, i) => dream_orig_x_02(d.data[0]))
                    .y0((d) => dream_orig_y_02(d[0] * orig_d_f_02))
                    .y1((d) => dream_orig_y_02(d[1] * orig_d_f_02))
                    .curve(d3.curveBasis)
            );

        let dream_orig_area_chart_up_02 = d3.selectAll("path.dream-orig-area-chart-02").data(dream_orig_area_data_stack_conv_02);
        dream_orig_area_chart_up_02.exit().remove();
        dream_orig_area_chart_up_02
            .join("path")
            .attr("class", (d, i) => `dream-orig-area-chart-02 ${dream_orig_area_countries_iso_02[i]}`)
            .style("fill-opacity", (d, i) => dream_orig_color_02(i) - 0.05)
            .style("stroke-opacity", (d, i) => dream_orig_color_02(i) + 0.3)
            .style("stroke-width", (d, i) => dream_orig_color_02(i) + 0.3)
            .attr(
                "d",
                d3
                    .area()
                    .x((d, i) => dream_orig_x_02(d.data[0]))
                    .y0((d) => dream_orig_y_02(d[0] * orig_d_f_02))
                    .y1((d) => dream_orig_y_02(d[1] * orig_d_f_02))
                    .curve(d3.curveBasis)
            );

        dream_orig_area_chart_txt_02 = dream_orig_svg_02_real_dream
            .selectAll("text.dream-orig-area-chart-02-txt")
            .data(dream_orig_area_data_stack_conv_02)
            .join("text")
            .attr("class", (d, i) => `dream-orig-area-chart-02-txt`)
            .style("text-align", "center")
            .style("text-anchor", "middle")
            .style("alignment-baseline", "middle")
            .style("font-size", "10px")
            .text((d, i) => (d[7].data[1][i].dream_orig_migrants_avg * orig_d_f_02 > 10 ? d[7].data[1][i].dest : ""))
            .attr("x", (d, i) => dream_orig_x_02(2012.5))
            .attr("y", (d, i) => dream_orig_y_02(d[7][0] + ((d[7][1] - d[7][0]) / 2) * orig_d_f_02))
            .style("fill", dream_txt_col);

        dream_orig_area_chart_02
            .on("mousemove", function () {
                atooltip_wrapper_02.style("opacity", 1).style("visibility", "visible");

                // get secondary class
                let selected_country = d3.select(this).attr("class").split(" ")[1];
                let el_box = d3.select(this).node().getBBox();
                let x_country = el_box.x + el_box.width / 2;
                // x_country = event.clientX;
                let y_country = el_box.y + el_box.height / 2 - 10;
                // y_country = event.clientY;

                atooltip_country_02.text(iso_country_fun(selected_country));

                let maxSize = document.getElementById("atooltip_country_02").getComputedTextLength();

                atooltip_background_02
                    .transition()
                    .duration(100)
                    .attr("x", -0.5 * maxSize * 1.6)
                    .attr("width", maxSize * 1.6);

                atooltip_wrapper_02
                    .transition()
                    .duration(100)
                    .attr("transform", "translate(" + (x_country - maxSize * 0.5) + "," + y_country + ")")
                    .style("opacity", 1);

                // select path
                d3.select(`.dream-orig-area-chart-02.${selected_country}`).style("fill", "#87004f");
            })
            .on("mouseout", function () {
                atooltip_wrapper_02.style("opacity", 0).style("visibility", "hidden");

                // select path
                d3.selectAll(`.dream-orig-area-chart-02`).style("fill", dream_area_s_col);
            });
    };
    //=====< 4. Dream Destination Area Chart >=====================================================>
    //=============================================================================================>
    //=============================================================================================>
    //=============================================================================================>
    let dream_dest_area_chart_fun_02 = function (selected_country_iso) {
        dream_dest_area_data_02 = migrants_data.filter((d) => d.dest_iso == selected_country_iso && d.dream_dest_migrants_avg > 0);

        dream_dest_area_data_02 = dream_dest_area_data_02.sort(dream_dest_sort_02);

        dream_dest_area_countries_02 = d3
            .flatGroup(
                dream_dest_area_data_02,
                (d) => d.orig,
                (d) => d.orig_iso
            )
            .map(function (d, i) {
                return {
                    country: d[0],
                    country_iso: d[1],
                    country_data: d[2],
                };
            })
            .map(function (d, i) {
                return d.country;
            });

        dream_dest_area_countries_iso_02 = d3
            .flatGroup(
                dream_dest_area_data_02,
                (d) => d.orig,
                (d) => d.orig_iso
            )
            .map(function (d, i) {
                return {
                    country: d[0],
                    country_iso: d[1],
                    country_data: d[2],
                };
            })
            .map(function (d, i) {
                return d.country_iso;
            });

        // countries serial
        dream_dest_area_countries_n_02 = d3.range(0, dream_dest_area_countries_02.length, 1);

        // stack data
        dream_dest_area_data_stack_02 = d3.group(dream_dest_area_data_02, (d) => d.year);

        // d3.stack
        dream_dest_area_data_stack_conv_02 = d3
            .stack()
            .keys(dream_dest_area_countries_n_02)
            .value((d, key) => d[1][key].dream_dest_migrants)(dream_dest_area_data_stack_02);

        // Chart Scales -----------------------------------------------------------------------------------
        dream_dest_y_02 = d3
            .scaleLinear()
            .domain([0, 100])
            .range([height_02 / 2 + 25, height_02 - 70]);

        // color scale
        dream_dest_color_02 = d3
            .scaleLinear()
            .domain([0, dream_dest_area_countries_02.length - 1])
            .range([0.8, 0.2]);

        // Area Chart -------------------------------------------------------------------------------------
        dream_dest_area_chart_02 = dream_dest_svg_02_real_dream
            .selectAll("path.dream-dest-area-chart-02")
            .data(dream_dest_area_data_stack_conv_02)
            .join("path")
            .attr("class", (d, i) => `dream-dest-area-chart-02 ${dream_dest_area_countries_iso_02[i]}`)
            .style("fill-opacity", (d, i) => dream_dest_color_02(i) - 0.05)
            .style("stroke-opacity", (d, i) => dream_dest_color_02(i) + 0.2)
            .style("stroke-width", (d, i) => dream_dest_color_02(i) + 0.1)
            .style("fill", (d, i) => dream_area_s_col)
            .style("stroke", (d, i) => dream_area_s_col)
            .attr(
                "d",
                d3
                    .area()
                    .x((d, i) => dream_dest_x_02(d.data[0]))
                    .y0((d) => dream_dest_y_02(d[0] * dest_d_f_02))
                    .y1((d) => dream_dest_y_02(d[1] * dest_d_f_02))
                    .curve(d3.curveBasis)
            );

        let dream_dest_area_chart_up_02 = d3.selectAll("path.dream-dest-area-chart-02").data(dream_dest_area_data_stack_conv_02);
        dream_dest_area_chart_up_02.exit().remove();
        dream_dest_area_chart_up_02
            .join("path")
            .attr("class", (d, i) => `dream-dest-area-chart-02 ${dream_dest_area_countries_iso_02[i]}`)
            .style("fill-opacity", (d, i) => dream_dest_color_02(i) - 0.05)
            .style("stroke-opacity", (d, i) => dream_dest_color_02(i) + 0.3)
            .style("stroke-width", (d, i) => dream_dest_color_02(i) + 0.3)
            .attr(
                "d",
                d3
                    .area()
                    .x((d, i) => dream_dest_x_02(d.data[0]))
                    .y0((d) => dream_dest_y_02(d[0] * dest_d_f_02))
                    .y1((d) => dream_dest_y_02(d[1] * dest_d_f_02))
                    .curve(d3.curveBasis)
            );

        dream_dest_area_chart_txt_02 = dream_dest_svg_02_real_dream
            .selectAll("text.dream-dest-area-chart-02-txt")
            .data(dream_dest_area_data_stack_conv_02)
            .join("text")
            .attr("class", (d, i) => `dream-dest-area-chart-02-txt`)
            .style("text-align", "center")
            .style("text-anchor", "middle")
            .style("alignment-baseline", "middle")
            .style("font-size", "10px")
            .text((d, i) => (d[7].data[1][i].dream_dest_migrants_avg * dest_d_f_02 > 20 ? d[7].data[1][i].orig : ""))
            .attr("x", (d, i) => dream_dest_x_02(2012.5))
            .attr("y", (d, i) => dream_dest_y_02(d[7][0] + ((d[7][1] - d[7][0]) / 2) * dest_d_f_02))
            .style("fill", dream_txt_col);

        dream_dest_area_chart_02
            .on("mousemove", function () {
                atooltip_wrapper_02.style("opacity", 1).style("visibility", "visible");

                // get secondary class
                let selected_country = d3.select(this).attr("class").split(" ")[1];
                let el_box = d3.select(this).node().getBBox();
                let x_country = el_box.x + el_box.width / 2;
                // x_country = event.clientX;
                let y_country = el_box.y + el_box.height / 2 - 10;
                // y_country = event.clientY;

                atooltip_country_02.text(iso_country_fun(selected_country));

                let maxSize = document.getElementById("atooltip_country_02").getComputedTextLength();

                atooltip_background_02
                    .transition()
                    .duration(100)
                    .attr("x", -0.5 * maxSize * 1.6)
                    .attr("width", maxSize * 1.6);

                atooltip_wrapper_02
                    .transition()
                    .duration(100)
                    .attr("transform", "translate(" + (x_country - maxSize * 0.5) + "," + y_country + ")")
                    .style("opacity", 1);

                // select path
                d3.select(`.dream-dest-area-chart-02.${selected_country}`).style("fill", "#87004f");
            })
            .on("mouseout", function () {
                atooltip_wrapper_02.style("opacity", 0).style("visibility", "hidden");

                // select path
                d3.selectAll(`.dream-dest-area-chart-02`).style("fill", dream_area_s_col);
            });
    };

    // svg_02_real_dream
    //=====< 5. Area Chart Lines & Axes >==========================================================>
    //=============================================================================================>
    //=============================================================================================>
    //=============================================================================================>
    // Chart Lines ---------------------------------------------------------------------------------
    // Lines
    const overlay_lines_02 = svg_02
        .selectAll("line.overlay-lines")
        .data([0, width_02 / 2 - 30, width_02 / 2 + 30, width_02])
        .join("line")
        .style("stroke", background_col)
        .style("stroke-width", 2)
        .attr("x1", (d) => d)
        .attr("y1", -20)
        .attr("x2", (d) => d)
        .attr("y2", height_02 + 20);
    // Chart Axes ----------------------------------------------------------------------------------
    // x-axis
    const real_area_x_axis_02 = svg_02
        .selectAll("text.real-area-x-axis-02")
        .data([2005, 2010, 2015, 2020])
        .join("text")
        .attr("class", (d, i) => `real-area-x-axis-02`)
        .style("text-align", "center")
        .style("text-anchor", "middle")
        .style("alignment-baseline", "middle")
        .style("font-size", "10px")
        .style("opacity", 0.7)
        .text((d, i) => d)
        .attr("x", (d, i) => real_orig_x_02(d))
        .attr("y", height_02 / 2)
        .style("fill", "grey");

    d3.select("text.real-area-x-axis-02").style("text-anchor", "start");
    d3.select(d3.selectAll("text.real-area-x-axis-02").nodes().reverse()[0]).style("text-anchor", "end");

    const dream_area_x_axis_02 = svg_02
        .selectAll("text.dream-area-x-axis-02")
        .data([2005, 2010, 2015, 2020])
        .join("text")
        .attr("class", (d, i) => `dream-area-x-axis-02`)
        .style("text-align", "center")
        .style("text-anchor", "middle")
        .style("alignment-baseline", "middle")
        .style("font-size", "10px")
        .style("opacity", 0.7)
        .text((d, i) => d)
        .attr("x", (d, i) => dream_orig_x_02(d))
        .attr("y", height_02 / 2)
        .style("fill", "grey");

    d3.select("text.dream-area-x-axis-02").style("text-anchor", "start");
    d3.select(d3.selectAll("text.dream-area-x-axis-02").nodes().reverse()[0]).style("text-anchor", "end");

    // y-axis
    real_orig_y_02 = d3
        .scaleLinear()
        .domain([0, 100])
        .range([height_02 / 2 - 25, 70]);

    dream_orig_y_02 = d3
        .scaleLinear()
        .domain([0, 100])
        .range([height_02 / 2 - 25, 70]);

    const out_area_y_axis_02 = svg_02
        .selectAll("text.out-area-y-axis")
        .data([0, 25, 50, 75, 100])
        .join("text")
        .attr("class", (d, i) => `out-area-y-axis`)
        .style("text-align", "center")
        .style("text-anchor", "middle")
        .style("alignment-baseline", "middle")
        .style("font-size", "10px")
        .style("opacity", 0.7)
        .text((d, i) => `- ${d}% -`)
        .attr("x", width_02 / 2)
        .attr("y", (d, i) => real_orig_y_02(d))
        .style("fill", "grey");

    // y-axis
    real_dest_y_02 = d3
        .scaleLinear()
        .domain([0, 100])
        .range([height_02 / 2 + 25, height_02 - 70]);

    dream_dest_y_02 = d3
        .scaleLinear()
        .domain([0, 100])
        .range([height_02 / 2 + 25, height_02 - 72]);

    const in_area_y_axis_02 = svg_02
        .selectAll("text.in-area-y-axis")
        .data([0, 25, 50, 75, 100])
        .join("text")
        .attr("class", (d, i) => `in-area-y-axis`)
        .style("text-align", "center")
        .style("text-anchor", "middle")
        .style("alignment-baseline", "middle")
        .style("font-size", "10px")
        .style("opacity", 0.7)
        .text((d, i) => `- ${d}% -`)
        .attr("x", width_02 / 2)
        .attr("y", (d, i) => real_dest_y_02(d))
        .style("fill", "grey");

    // annotations
    const area_annotation_02 = svg_02
        .append("g")
        .attr("class", (d, i) => `area-annotation`)
        .style("text-align", "center")
        .style("text-anchor", "middle")
        .style("alignment-baseline", "middle")
        .style("font-size", "14px")
        .style("opacity", 0.9)
        .style("fill", "grey")
        .each(function () {
            d3.select(this)
                .append("text")
                .attr("x", real_orig_x_02(2012.5))
                .attr("y", real_orig_y_02(140))
                .text("Reality")
                .style("font-size", "20px")
                .style("fill", real_area_s_col);
            d3.select(this)
                .append("text")
                .attr("x", dream_orig_x_02(2012.5))
                .attr("y", dream_orig_y_02(140))
                .text("Dream")
                .style("font-size", "20px")
                .style("fill", dream_area_s_col);

            d3.select(this).append("text").attr("x", real_orig_x_02(2012.5)).attr("y", real_orig_y_02(130)).text("Migrant's real flow");

            d3.select(this)
                .append("text")
                .attr("x", real_orig_x_02(2012.5))
                .attr("y", real_orig_y_02(130) + 20)
                .text("out of the country");

            d3.select(this)
                .append("text")
                .attr("x", real_dest_x_02(2012.5))
                .attr("y", real_dest_y_02(130) - 20)
                .text("Migrant's real flow");

            d3.select(this).append("text").attr("x", real_dest_x_02(2012.5)).attr("y", real_dest_y_02(130)).text("into the country");

            d3.select(this).append("text").attr("x", dream_orig_x_02(2012.5)).attr("y", dream_orig_y_02(130)).text("Migrant's dream flow");

            d3.select(this)
                .append("text")
                .attr("x", dream_orig_x_02(2012.5))
                .attr("y", dream_orig_y_02(130) + 20)
                .text("out of the country");

            d3.select(this)
                .append("text")
                .attr("x", dream_dest_x_02(2012.5))
                .attr("y", dream_dest_y_02(130) - 20)
                .text("Migrant's dream flow");

            d3.select(this).append("text").attr("x", dream_dest_x_02(2012.5)).attr("y", dream_dest_y_02(130)).text("into the country");

            // countries
            // d3.select(this)
            //     .append("text")
            //     .attr("x", real_orig_x_02(2012.5))
            //     .attr("y", real_orig_y_02(93))
            //     .style("font-size", "10px")
            //     .style("fill", real_txt_col)
            //     .text("Saudi Arabia");

            // d3.select(this)
            //     .append("text")
            //     .attr("x", real_orig_x_02(2012.5))
            //     .attr("y", real_orig_y_02(101))
            //     .style("font-size", "10px")
            //     .style("fill", real_txt_col)
            //     .text("Turkey");

            // d3.select(this)
            //     .append("text")
            //     .attr("x", dream_orig_x_02(2012.5))
            //     .attr("y", dream_orig_y_02(14))
            //     .style("font-size", "10px")
            //     .style("fill", dream_txt_col)
            //     .text("Germany");

            // d3.select(this)
            //     .append("text")
            //     .attr("x", dream_orig_x_02(2014))
            //     .attr("y", dream_orig_y_02(21))
            //     .style("font-size", "10px")
            //     .style("fill", dream_txt_col)
            //     .text("Canada");

            // d3.select(this)
            //     .append("text")
            //     .attr("x", dream_orig_x_02(2012.5))
            //     .attr("y", dream_orig_y_02(29))
            //     .style("font-size", "10px")
            //     .style("fill", dream_txt_col)
            //     .text("Australia");

            d3.select(this)
                .append("text")
                .attr("x", width_02 / 2)
                .attr("y", -55)
                .style("font-size", "16px")
                .style("fill", "#6e6e6e")
                .text("United States");

            d3.select(this)
                .append("text")
                .attr("x", width_02 / 2)
                .attr("y", -38)
                .style("font-size", "12px")
                .style("fill", "#6e6e6e")
                .style("opacity", 0.9)
                .text("Y2020");

            d3.select(this)
                .append("line")
                .attr("x1", width_02 / 2 - 120)
                .attr("y1", -30)
                .attr("x2", width_02 / 2 + 120)
                .attr("y2", -30)
                .style("stroke", "white")
                .style("stroke-dasharray", "3 3")
                .style("stroke-width", 0.5);

            d3.select(this)
                .append("circle")
                .attr("cx", width_02 / 2 - 120)
                .attr("cy", -30)
                .attr("r", 3)
                .style("fill", "#6e6e6e");

            d3.select(this)
                .append("circle")
                .attr("cx", width_02 / 2 + 120)
                .attr("cy", -30)
                .attr("r", 3)
                .style("fill", "#6e6e6e");

            d3.select(this)
                .append("text")
                .attr("x", width_02 / 2)
                .attr("y", -13)
                .style("font-size", "12px")
                .style("fill", "#6e6e6e")
                .text("Migrants in: 46.6m | Migrants out: 2.8m");
        });

    atooltip_wrapper_02.raise();

    //
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // 00. dropdown ///////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Initial Setting
    // d3.select("#myInput");
    const iso_c = "USA";
    real_orig_area_chart_fun_02(iso_c);
    real_dest_area_chart_fun_02(iso_c);
    dream_orig_area_chart_fun_02(iso_c);
    dream_dest_area_chart_fun_02(iso_c);
}; // end of dataviz_02

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 02. SVG_03  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Dimensions
let dimensions_03 = {
    width: window.innerWidth * 0.95,
    height: window.innerHeight * 0.9,
    margin: {
        top: 120,
        right: 100,
        bottom: 120,
        left: 100,
    },
};

//Define drawing area within "dimensions" object
dimensions_03.vizboardWidth = dimensions_03.width - dimensions_03.margin.left - dimensions_03.margin.right;
dimensions_03.vizboardHeight = dimensions_03.height - dimensions_03.margin.top - dimensions_03.margin.bottom;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Draw SVG
const vizboard_width_03 = 1200;
const vizboard_height_03 = 800;

let svg_vizboard_03 = d3
    .select("#svg-vizboard-03")
    .append("svg")
    .classed("svg-vizboard-03", true)
    .attr("viewBox", `0 0 ${vizboard_width_03} ${vizboard_height_03}`)
    .attr("preserveAspectRatio", "xMinYMin meet");
// .style("border", "1px dashed pink");

svg_03 = svg_vizboard_03.append("g").style("transform", `translate(${dimensions_03.margin.left}px, ${dimensions_03.margin.top}px)`);

// Create SVG dimensions
const width_03 = vizboard_width_03 - dimensions_03.margin.left - dimensions_03.margin.right;
const height_03 = vizboard_height_03 - dimensions_03.margin.top - dimensions_03.margin.bottom;

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 01. dataviz_03 /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const dataviz_03 = function () {
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Nested Data ////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //=====< Origin Data >=========================================================>
    //====== https://observablehq.com/@d3/d3-flatgroup

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Scales  ////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Interaction Settings ///////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //=====< Setup >===============================================================================>
    //=============================================================================================>
    //=====< Map's Circles Location Function >=====================================================>
    let get_cxy = function (iso) {
        let x = d3.select(`#${iso}`).attr("cx");
        let y = d3.select(`#${iso}`).attr("cy");
        return { cx: x, cy: y };
    };

    //=====< Iso to Serial Function >==============================================================>
    let iso_serial_fun = function (x) {
        let iso_serial = d3
            .flatGroup(
                migrants_avg_data,
                (d) => d.country_iso,
                (d) => d.serial
            )
            .map((d, i) => {
                return {
                    iso: d[0],
                    serial: d[1],
                };
            })
            .filter((d) => d.iso == x)[0].serial;
        return iso_serial - 1;
    };

    //=====< Iso to Name Function >==============================================================>
    let iso_country_fun = function (x) {
        let iso_name = migrants_avg_data.filter((d) => d.country_iso == x)[0].country;
        return iso_name;
    };
    //=====< Iso to Name Function >==============================================================>
    let country_iso_fun = function (x) {
        let iso_name = migrants_avg_data.filter((d) => d.country == x)[0].country_iso;
        return iso_name;
    };

    // console.log(country_iso_fun("Egypt"));
    //=====< Sum Function >=======================================================================>
    let iso_sum_fun = function (iso) {
        return migrants_sum_data.filter((d) => d.country_iso == iso)[0];
    };

    //=====< Setup >===============================================================================>
    let year_x = 2020;
    let t_sec = 700;

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Area Chart  ////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const real_orig_svg_03_real_dream = svg_03.append("g");
    const real_dest_svg_03_real_dream = svg_03.append("g");
    const dream_orig_svg_03_real_dream = svg_03.append("g");
    const dream_dest_svg_03_real_dream = svg_03.append("g");

    // svg_03_real_dream.style("visibility", "hidden");

    // let country_name = "Egypt";
    // let selected_country_iso = country_iso_fun(country_name);

    // sorting functions
    let real_orig_sort_03 = function (a, b) {
        return b.real_orig_migrants_avg - a.real_orig_migrants_avg;
    };

    let real_dest_sort_03 = function (a, b) {
        return b.real_dest_migrants_avg - a.real_dest_migrants_avg;
    };

    let dream_orig_sort_03 = function (a, b) {
        return b.dream_orig_migrants_avg - a.dream_orig_migrants_avg;
    };

    let dream_dest_sort_03 = function (a, b) {
        return b.dream_dest_migrants_avg - a.dream_dest_migrants_avg;
    };

    // General letiables
    let orig_orig_real_03;
    let orig_orig_dream_03;
    let orig_dest_real_03;
    let orig_dest_dream_03;

    let orig_r_f_03;
    let orig_d_f_03;
    let dest_r_f_03;
    let dest_d_f_03;

    let area_opacity_03 = d3.scaleLinear().domain([0, 100]).range([0.01, 0.4]);

    let real_orig_x_03 = d3
        .scaleLinear()
        .domain([2005, 2020])
        .range([0, width_03 / 2 - 30]);
    let real_dest_x_03 = d3
        .scaleLinear()
        .domain([2005, 2020])
        .range([0, width_03 / 2 - 30]);
    let dream_orig_x_03 = d3
        .scaleLinear()
        .domain([2005, 2020])
        .range([width_03 / 2 + 30, width_03]);
    let dream_dest_x_03 = d3
        .scaleLinear()
        .domain([2005, 2020])
        .range([width_03 / 2 + 30, width_03]);

    // Real Origin letiables
    let real_orig_area_data_03;
    let real_dest_area_data_03;
    let dream_orig_area_data_03;
    let dream_dest_area_data_03;

    let real_orig_area_countries_03;
    let real_dest_area_countries_03;
    let dream_orig_area_countries_03;
    let dream_dest_area_countries_03;

    let real_orig_area_countries_iso_03;
    let real_dest_area_countries_iso_03;
    let dream_orig_area_countries_iso_03;
    let dream_dest_area_countries_iso_03;

    let real_orig_area_countries_n_03;
    let real_dest_area_countries_n_03;
    let dream_orig_area_countries_n_03;
    let dream_dest_area_countries_n_03;

    let real_orig_area_data_stack_03;
    let real_dest_area_data_stack_03;
    let dream_orig_area_data_stack_03;
    let dream_dest_area_data_stack_03;

    let real_orig_area_data_stack_conv_03;
    let real_dest_area_data_stack_conv_03;
    let dream_orig_area_data_stack_conv_03;
    let dream_dest_area_data_stack_conv_03;

    let real_orig_y_03;
    let real_dest_y_03;
    let dream_orig_y_03;
    let dream_dest_y_03;

    let real_orig_color_03;
    let real_dest_color_03;
    let dream_orig_color_03;
    let dream_dest_color_03;

    let real_orig_area_chart_03;
    let real_dest_area_chart_03;
    let dream_orig_area_chart_03;
    let dream_dest_area_chart_03;

    let real_orig_area_chart_txt_03;
    let real_dest_area_chart_txt_03;
    let dream_orig_area_chart_txt_03;
    let dream_dest_area_chart_txt_03;
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Tooltip  ///////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    let atooltip_wrapper_03 = svg_03
        .append("g")
        .attr("class", "atooltip-wrapper-03")
        .attr("transform", "translate(" + 0 + "," + 0 + ")")
        .style("font-size", `12px`)
        .style("opacity", 1);

    let atooltip_background_03 = atooltip_wrapper_03
        .append("rect")
        .attr("class", "atooltip-background-03")
        .attr("x", 0)
        .attr("y", 13)
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("width", 0)
        .attr("height", 26)
        .style("opacity", 0.8)
        .style("fill", background_col);

    let atooltip_country_03 = atooltip_wrapper_03
        .append("text")
        .attr("class", "atooltip-country-03")
        .attr("id", "atooltip_country_03")
        .style("text-align", "center")
        .style("text-anchor", "middle")
        .style("alignment-baseline", "middle")
        .attr("y", 27)
        .style("fill", "#adadad")
        .text("");

    //=====< 1. Real Origin Area Chart >===========================================================>
    //=============================================================================================>
    //=============================================================================================>
    //=============================================================================================>

    real_orig_area_chart_fun_03 = function (selected_country_iso) {
        real_orig_area_data_03 = migrants_data.filter((d) => d.orig_iso == selected_country_iso && d.real_orig_migrants_avg > 0);

        real_orig_area_data_03 = real_orig_area_data_03.sort(real_orig_sort_03);

        orig_orig_real_03 = real_orig_area_data_03[0].orig_real_fact;
        orig_orig_dream_03 = real_orig_area_data_03[0].orig_dream_fact;
        orig_dest_real_03 = real_orig_area_data_03[0].orig_real_fact;
        orig_dest_dream_03 = real_orig_area_data_03[0].orig_dream_fact;

        orig_r_f_03 = orig_orig_real_03;
        orig_d_f_03 = orig_orig_dream_03;
        dest_r_f_03 = orig_dest_real_03;
        dest_d_f_03 = orig_dest_dream_03;

        // console.log(orig_orig_real, orig_orig_dream, orig_dest_real, orig_dest_dream);
        console.log(orig_r_f_03, orig_d_f_03, dest_r_f_03, dest_d_f_03);
        // console.log(orig_orig_real, orig_orig_dream);
        // console.log(orig_r_f, orig_d_f);

        real_orig_area_countries_03 = d3
            .flatGroup(
                real_orig_area_data_03,
                (d) => d.dest,
                (d) => d.dest_iso
            )
            .map(function (d, i) {
                return {
                    country: d[0],
                    country_iso: d[1],
                    country_data: d[2],
                };
            })
            .map(function (d, i) {
                return d.country;
            });

        real_orig_area_countries_iso_03 = d3
            .flatGroup(
                real_orig_area_data_03,
                (d) => d.dest,
                (d) => d.dest_iso
            )
            .map(function (d, i) {
                return {
                    country: d[0],
                    country_iso: d[1],
                    country_data: d[2],
                };
            })
            .map(function (d, i) {
                return d.country_iso;
            });

        // console.log(real_orig_area_countries_iso);

        // countries serial
        real_orig_area_countries_n_03 = d3.range(0, real_orig_area_countries_03.length, 1);
        // console.log(real_orig_area_countries_n);

        // stack data
        real_orig_area_data_stack_03 = d3.group(real_orig_area_data_03, (d) => d.year);

        // console.log(real_orig_area_data_stack);

        // d3.stack
        real_orig_area_data_stack_conv_03 = d3
            .stack()
            .keys(real_orig_area_countries_n_03)
            .value((d, key) => d[1][key].real_orig_migrants)(real_orig_area_data_stack_03);

        // console.log(real_orig_area_data_stack_conv);

        // Chart Scales -----------------------------------------------------------------------------------
        // real_orig_y = d3
        //     .scaleLinear()
        //     .domain([0, 100])
        //     .range([height_03 / 2 - 25, 0]);

        real_orig_y_03 = d3
            .scaleLinear()
            .domain([0, 100])
            .range([height_03 / 2 - 25, 70]);

        // color scale
        real_orig_color_03 = d3
            .scaleLinear()
            .domain([0, real_orig_area_countries_03.length - 1])
            .range([0.8, 0.2]);

        // Area Chart -------------------------------------------------------------------------------------
        real_orig_area_chart_03 = real_orig_svg_03_real_dream
            .selectAll("path.real-orig-area-chart-03")
            .data(real_orig_area_data_stack_conv_03)
            .join("path")
            .attr("class", (d, i) => `real-orig-area-chart-03 ${real_orig_area_countries_iso_03[i]}`)
            .style("fill-opacity", (d, i) => real_orig_color_03(i) - 0.05)
            .style("stroke-opacity", (d, i) => real_orig_color_03(i) + 0.2)
            .style("stroke-width", (d, i) => real_orig_color_03(i) + 0.1)
            .style("fill", (d, i) => real_area_s_col)
            .style("stroke", (d, i) => real_area_s_col)
            .attr(
                "d",
                d3
                    .area()
                    .x((d, i) => real_orig_x_03(d.data[0]))
                    .y0((d) => real_orig_y_03(d[0] * orig_r_f_03))
                    .y1((d) => real_orig_y_03(d[1] * orig_r_f_03))
                    .curve(d3.curveBasis)
            );

        let real_orig_area_chart_up_03 = d3.selectAll("path.real-orig-area-chart-03").data(real_orig_area_data_stack_conv_03);
        real_orig_area_chart_up_03.exit().remove();
        real_orig_area_chart_up_03
            .join("path")
            .attr("class", (d, i) => `real-orig-area-chart-03 ${real_orig_area_countries_iso_03[i]}`)
            .style("fill-opacity", (d, i) => real_orig_color_03(i) - 0.05)
            .style("stroke-opacity", (d, i) => real_orig_color_03(i) + 0.3)
            .style("stroke-width", (d, i) => real_orig_color_03(i) + 0.3)
            .attr(
                "d",
                d3
                    .area()
                    .x((d, i) => real_orig_x_03(d.data[0]))
                    .y0((d) => real_orig_y_03(d[0] * orig_r_f_03))
                    .y1((d) => real_orig_y_03(d[1] * orig_r_f_03))
                    .curve(d3.curveBasis)
            );

        real_orig_area_chart_txt_03 = real_orig_svg_03_real_dream
            .selectAll("text.real-orig-area-chart-03-txt")
            .data(real_orig_area_data_stack_conv_03)
            .join("text")
            .attr("class", (d, i) => `real-orig-area-chart-03-txt`)
            .style("text-align", "center")
            .style("text-anchor", "middle")
            .style("alignment-baseline", "middle")
            .style("font-size", "10px")
            .text((d, i) => (d[7].data[1][i].real_orig_migrants_avg * orig_r_f_03 > 30 ? d[7].data[1][i].dest : ""))
            .attr("x", (d, i) => real_orig_x_03(2012.5))
            .attr("y", (d, i) => real_orig_y_03(d[7][0] + ((d[7][1] - d[7][0]) / 2) * orig_r_f_03))
            .style("fill", real_txt_col);

        real_orig_area_chart_03
            .on("mousemove", function () {
                atooltip_wrapper_03.style("opacity", 1).style("visibility", "visible");

                // get secondary class
                let selected_country = d3.select(this).attr("class").split(" ")[1];
                let el_box = d3.select(this).node().getBBox();
                let x_country = el_box.x + el_box.width / 2;
                // x_country = event.clientX;
                let y_country = el_box.y + el_box.height / 2 - 10;
                // y_country = event.clientY;

                atooltip_country_03.text(iso_country_fun(selected_country));

                let maxSize = document.getElementById("atooltip_country_03").getComputedTextLength();

                atooltip_background_03
                    .transition()
                    .duration(100)
                    .attr("x", -0.5 * maxSize * 1.6)
                    .attr("width", maxSize * 1.6);

                atooltip_wrapper_03
                    .transition()
                    .duration(100)
                    .attr("transform", "translate(" + (x_country - maxSize * 0.5) + "," + y_country + ")")
                    .style("opacity", 1);

                // select path
                d3.select(`.real-orig-area-chart-03.${selected_country}`).style("fill", "#008a77");
            })
            .on("mouseout", function () {
                atooltip_wrapper_03.style("opacity", 0).style("visibility", "hidden");

                // select path
                d3.selectAll(`.real-orig-area-chart-03`).style("fill", real_area_s_col);
            });
    };
    //=====< 2. Real Destination Area Chart >======================================================>
    //=============================================================================================>
    //=============================================================================================>
    //=============================================================================================>
    real_dest_area_chart_fun_03 = function (selected_country_iso) {
        real_dest_area_data_03 = migrants_data.filter((d) => d.dest_iso == selected_country_iso && d.real_dest_migrants_avg > 0);
        // console.log(real_dest_area_data);

        real_dest_area_data_03 = real_dest_area_data_03.sort(real_dest_sort_03);

        real_dest_area_countries_03 = d3
            .flatGroup(
                real_dest_area_data_03,
                (d) => d.orig,
                (d) => d.orig_iso
            )
            .map(function (d, i) {
                return {
                    country: d[0],
                    country_iso: d[1],
                    country_data: d[2],
                };
            })
            .map(function (d, i) {
                return d.country;
            });

        real_dest_area_countries_iso_03 = d3
            .flatGroup(
                real_dest_area_data_03,
                (d) => d.orig,
                (d) => d.orig_iso
            )
            .map(function (d, i) {
                return {
                    country: d[0],
                    country_iso: d[1],
                    country_data: d[2],
                };
            })
            .map(function (d, i) {
                return d.country_iso;
            });

        // countries serial
        real_dest_area_countries_n_03 = d3.range(0, real_dest_area_countries_03.length, 1);

        // stack data
        real_dest_area_data_stack_03 = d3.group(real_dest_area_data_03, (d) => d.year);

        // d3.stack
        real_dest_area_data_stack_conv_03 = d3
            .stack()
            .keys(real_dest_area_countries_n_03)
            .value((d, key) => d[1][key].real_dest_migrants)(real_dest_area_data_stack_03);

        // Chart Scales -----------------------------------------------------------------------------------
        real_dest_y_03 = d3
            .scaleLinear()
            .domain([0, 100])
            .range([height_03 / 2 + 25, height_03 - 70]);

        // color scale
        real_dest_color_03 = d3
            .scaleLinear()
            .domain([0, real_dest_area_countries_03.length - 1])
            .range([0.8, 0.2]);

        // Area Chart -------------------------------------------------------------------------------------
        real_dest_area_chart_03 = real_dest_svg_03_real_dream
            .selectAll("path.real-dest-area-chart-03")
            .data(real_dest_area_data_stack_conv_03)
            .join("path")
            .attr("class", (d, i) => `real-dest-area-chart-03 ${real_dest_area_countries_iso_03[i]}`)
            .style("fill-opacity", (d, i) => real_dest_color_03(i) - 0.05)
            .style("stroke-opacity", (d, i) => real_dest_color_03(i) + 0.2)
            .style("stroke-width", (d, i) => real_dest_color_03(i) + 0.1)

            .style("fill", (d, i) => real_area_s_col)
            .style("stroke", (d, i) => real_area_s_col)
            .attr(
                "d",
                d3
                    .area()
                    .x((d, i) => real_dest_x_03(d.data[0]))
                    .y0((d) => real_dest_y_03(d[0] * dest_r_f_03))
                    .y1((d) => real_dest_y_03(d[1] * dest_r_f_03))
                    .curve(d3.curveBasis)
            );

        let real_dest_area_chart_up_03 = d3.selectAll("path.real-dest-area-chart-03").data(real_dest_area_data_stack_conv_03);
        real_dest_area_chart_up_03.exit().remove();
        real_dest_area_chart_up_03
            .join("path")
            .attr("class", (d, i) => `real-dest-area-chart-03 ${real_dest_area_countries_iso_03[i]}`)
            .style("fill-opacity", (d, i) => real_dest_color_03(i) - 0.05)
            .style("stroke-opacity", (d, i) => real_dest_color_03(i) + 0.3)
            .style("stroke-width", (d, i) => real_dest_color_03(i) + 0.3)
            .attr(
                "d",
                d3
                    .area()
                    .x((d, i) => real_dest_x_03(d.data[0]))
                    .y0((d) => real_dest_y_03(d[0] * dest_r_f_03))
                    .y1((d) => real_dest_y_03(d[1] * dest_r_f_03))
                    .curve(d3.curveBasis)
            );

        let real_dest_area_chart_txt_03 = real_dest_svg_03_real_dream
            .selectAll("text.real-dest-area-chart-03-txt")
            .data(real_dest_area_data_stack_conv_03)
            .join("text")
            .attr("class", (d, i) => `real-dest-area-chart-03-txt`)
            .style("text-align", "center")
            .style("text-anchor", "middle")
            .style("alignment-baseline", "middle")
            .style("font-size", "10px")
            .text((d, i) => (d[7].data[1][i].real_dest_migrants_avg * dest_r_f_03 > 30 ? d[7].data[1][i].orig : ""))
            .attr("x", (d, i) => real_dest_x_03(2012.5))
            .attr("y", (d, i) => real_dest_y_03(d[7][0] + ((d[7][1] - d[7][0]) / 2) * dest_r_f_03))
            .style("fill", real_txt_col);

        real_dest_area_chart_03
            .on("mouseover", function () {
                atooltip_wrapper_03.style("opacity", 1).style("visibility", "visible");

                // get secondary class
                let selected_country = d3.select(this).attr("class").split(" ")[1];
                let el_box = d3.select(this).node().getBBox();
                let x_country = el_box.x + el_box.width / 2;
                // x_country = event.clientX;
                let y_country = el_box.y + el_box.height / 2 - 10;
                // y_country = event.clientY;

                atooltip_country_03.text(iso_country_fun(selected_country));

                let maxSize = document.getElementById("atooltip_country_03").getComputedTextLength();

                atooltip_background_03
                    .transition()
                    .duration(100)
                    .attr("x", -0.5 * maxSize * 1.6)
                    .attr("width", maxSize * 1.6);

                atooltip_wrapper_03
                    .transition()
                    .duration(100)
                    .attr("transform", "translate(" + (x_country - maxSize * 0.5) + "," + y_country + ")")
                    .style("opacity", 1);

                // select path
                d3.select(`.real-dest-area-chart-03.${selected_country}`).style("fill", "#008a77");
            })
            .on("mouseout", function () {
                atooltip_wrapper_03.style("opacity", 0).style("visibility", "hidden");

                // select path
                d3.selectAll(`.real-dest-area-chart-03`).style("fill", real_area_s_col);
            });
    };
    //=====< 3. Dream Origin Area Chart >==========================================================>
    //=============================================================================================>
    //=============================================================================================>
    //=============================================================================================>

    dream_orig_area_chart_fun_03 = function (selected_country_iso) {
        dream_orig_area_data_03 = migrants_data.filter((d) => d.orig_iso == selected_country_iso && d.dream_orig_migrants_avg > 0);

        dream_orig_area_data_03 = dream_orig_area_data_03.sort(dream_orig_sort_03);

        dream_orig_area_countries_03 = d3
            .flatGroup(
                dream_orig_area_data_03,
                (d) => d.dest,
                (d) => d.dest_iso
            )
            .map(function (d, i) {
                return {
                    country: d[0],
                    country_iso: d[1],
                    country_data: d[2],
                };
            })
            .map(function (d, i) {
                return d.country;
            });

        dream_orig_area_countries_iso_03 = d3
            .flatGroup(
                dream_orig_area_data_03,
                (d) => d.dest,
                (d) => d.dest_iso
            )
            .map(function (d, i) {
                return {
                    country: d[0],
                    country_iso: d[1],
                    country_data: d[2],
                };
            })
            .map(function (d, i) {
                return d.country_iso;
            });

        // console.log(real_orig_area_countries_iso);

        // countries serial
        dream_orig_area_countries_n_03 = d3.range(0, dream_orig_area_countries_03.length, 1);
        // console.log(real_orig_area_countries_n);

        // stack data
        dream_orig_area_data_stack_03 = d3.group(dream_orig_area_data_03, (d) => d.year);

        // console.log(real_orig_area_data_stack);

        // d3.stack
        dream_orig_area_data_stack_conv_03 = d3
            .stack()
            .keys(dream_orig_area_countries_n_03)
            .value((d, key) => d[1][key].dream_orig_migrants)(dream_orig_area_data_stack_03);

        // console.log(real_orig_area_data_stack_conv);

        // Chart Scales -----------------------------------------------------------------------------------
        dream_orig_y_03 = d3
            .scaleLinear()
            .domain([0, 100])
            .range([height_03 / 2 - 25, 70]);

        // color scale
        dream_orig_color_03 = d3
            .scaleLinear()
            .domain([0, dream_orig_area_countries_03.length - 1])
            .range([0.8, 0.2]);

        // Area Chart -------------------------------------------------------------------------------------
        dream_orig_area_chart_03 = dream_orig_svg_03_real_dream
            .selectAll("path.dream-orig-area-chart-03")
            .data(dream_orig_area_data_stack_conv_03)
            .join("path")
            .attr("class", (d, i) => `dream-orig-area-chart-03 ${dream_orig_area_countries_iso_03[i]}`)
            .style("fill-opacity", (d, i) => dream_orig_color_03(i) - 0.05)
            .style("stroke-opacity", (d, i) => dream_orig_color_03(i) + 0.2)
            .style("stroke-width", (d, i) => dream_orig_color_03(i) + 0.1)
            .style("fill", (d, i) => dream_area_s_col)
            .style("stroke", (d, i) => dream_area_s_col)
            .attr(
                "d",
                d3
                    .area()
                    .x((d, i) => dream_orig_x_03(d.data[0]))
                    .y0((d) => dream_orig_y_03(d[0] * orig_d_f_03))
                    .y1((d) => dream_orig_y_03(d[1] * orig_d_f_03))
                    .curve(d3.curveBasis)
            );

        let dream_orig_area_chart_up_03 = d3.selectAll("path.dream-orig-area-chart-03").data(dream_orig_area_data_stack_conv_03);
        dream_orig_area_chart_up_03.exit().remove();
        dream_orig_area_chart_up_03
            .join("path")
            .attr("class", (d, i) => `dream-orig-area-chart-03 ${dream_orig_area_countries_iso_03[i]}`)
            .style("fill-opacity", (d, i) => dream_orig_color_03(i) - 0.05)
            .style("stroke-opacity", (d, i) => dream_orig_color_03(i) + 0.3)
            .style("stroke-width", (d, i) => dream_orig_color_03(i) + 0.3)
            .attr(
                "d",
                d3
                    .area()
                    .x((d, i) => dream_orig_x_03(d.data[0]))
                    .y0((d) => dream_orig_y_03(d[0] * orig_d_f_03))
                    .y1((d) => dream_orig_y_03(d[1] * orig_d_f_03))
                    .curve(d3.curveBasis)
            );

        dream_orig_area_chart_txt_03 = dream_orig_svg_03_real_dream
            .selectAll("text.dream-orig-area-chart-03-txt")
            .data(dream_orig_area_data_stack_conv_03)
            .join("text")
            .attr("class", (d, i) => `dream-orig-area-chart-03-txt`)
            .style("text-align", "center")
            .style("text-anchor", "middle")
            .style("alignment-baseline", "middle")
            .style("font-size", "10px")
            .text((d, i) => (d[7].data[1][i].dream_orig_migrants_avg * orig_d_f_03 > 30 ? d[7].data[1][i].dest : ""))
            .attr("x", (d, i) => dream_orig_x_03(2012.5))
            .attr("y", (d, i) => dream_orig_y_03(d[7][0] + ((d[7][1] - d[7][0]) / 2) * orig_d_f_03))
            .style("fill", dream_txt_col);

        dream_orig_area_chart_03
            .on("mousemove", function () {
                atooltip_wrapper_03.style("opacity", 1).style("visibility", "visible");

                // get secondary class
                let selected_country = d3.select(this).attr("class").split(" ")[1];
                let el_box = d3.select(this).node().getBBox();
                let x_country = el_box.x + el_box.width / 2;
                // x_country = event.clientX;
                let y_country = el_box.y + el_box.height / 2 - 10;
                // y_country = event.clientY;

                atooltip_country_03.text(iso_country_fun(selected_country));

                let maxSize = document.getElementById("atooltip_country_03").getComputedTextLength();

                atooltip_background_03
                    .transition()
                    .duration(100)
                    .attr("x", -0.5 * maxSize * 1.6)
                    .attr("width", maxSize * 1.6);

                atooltip_wrapper_03
                    .transition()
                    .duration(100)
                    .attr("transform", "translate(" + (x_country - maxSize * 0.5) + "," + y_country + ")")
                    .style("opacity", 1);

                // select path
                d3.select(`.dream-orig-area-chart-03.${selected_country}`).style("fill", "#87004f");
            })
            .on("mouseout", function () {
                atooltip_wrapper_03.style("opacity", 0).style("visibility", "hidden");

                // select path
                d3.selectAll(`.dream-orig-area-chart-03`).style("fill", dream_area_s_col);
            });
    };
    //=====< 4. Dream Destination Area Chart >=====================================================>
    //=============================================================================================>
    //=============================================================================================>
    //=============================================================================================>
    dream_dest_area_chart_fun_03 = function (selected_country_iso) {
        dream_dest_area_data_03 = migrants_data.filter((d) => d.dest_iso == selected_country_iso && d.dream_dest_migrants_avg > 0);

        dream_dest_area_data_03 = dream_dest_area_data_03.sort(dream_dest_sort_03);

        dream_dest_area_countries_03 = d3
            .flatGroup(
                dream_dest_area_data_03,
                (d) => d.orig,
                (d) => d.orig_iso
            )
            .map(function (d, i) {
                return {
                    country: d[0],
                    country_iso: d[1],
                    country_data: d[2],
                };
            })
            .map(function (d, i) {
                return d.country;
            });

        dream_dest_area_countries_iso_03 = d3
            .flatGroup(
                dream_dest_area_data_03,
                (d) => d.orig,
                (d) => d.orig_iso
            )
            .map(function (d, i) {
                return {
                    country: d[0],
                    country_iso: d[1],
                    country_data: d[2],
                };
            })
            .map(function (d, i) {
                return d.country_iso;
            });

        // countries serial
        dream_dest_area_countries_n_03 = d3.range(0, dream_dest_area_countries_03.length, 1);

        // stack data
        dream_dest_area_data_stack_03 = d3.group(dream_dest_area_data_03, (d) => d.year);

        // d3.stack
        dream_dest_area_data_stack_conv_03 = d3
            .stack()
            .keys(dream_dest_area_countries_n_03)
            .value((d, key) => d[1][key].dream_dest_migrants)(dream_dest_area_data_stack_03);

        // Chart Scales -----------------------------------------------------------------------------------
        dream_dest_y_03 = d3
            .scaleLinear()
            .domain([0, 100])
            .range([height_03 / 2 + 25, height_03 - 70]);

        // color scale
        dream_dest_color_03 = d3
            .scaleLinear()
            .domain([0, dream_dest_area_countries_03.length - 1])
            .range([0.8, 0.2]);

        // Area Chart -------------------------------------------------------------------------------------
        dream_dest_area_chart_03 = dream_dest_svg_03_real_dream
            .selectAll("path.dream-dest-area-chart-03")
            .data(dream_dest_area_data_stack_conv_03)
            .join("path")
            .attr("class", (d, i) => `dream-dest-area-chart-03 ${dream_dest_area_countries_iso_03[i]}`)
            .style("fill-opacity", (d, i) => dream_dest_color_03(i) - 0.05)
            .style("stroke-opacity", (d, i) => dream_dest_color_03(i) + 0.2)
            .style("stroke-width", (d, i) => dream_dest_color_03(i) + 0.1)
            .style("fill", (d, i) => dream_area_s_col)
            .style("stroke", (d, i) => dream_area_s_col)
            .attr(
                "d",
                d3
                    .area()
                    .x((d, i) => dream_dest_x_03(d.data[0]))
                    .y0((d) => dream_dest_y_03(d[0] * dest_d_f_03))
                    .y1((d) => dream_dest_y_03(d[1] * dest_d_f_03))
                    .curve(d3.curveBasis)
            );

        let dream_dest_area_chart_up_03 = d3.selectAll("path.dream-dest-area-chart-03").data(dream_dest_area_data_stack_conv_03);
        dream_dest_area_chart_up_03.exit().remove();
        dream_dest_area_chart_up_03
            .join("path")
            .attr("class", (d, i) => `dream-dest-area-chart-03 ${dream_dest_area_countries_iso_03[i]}`)
            .style("fill-opacity", (d, i) => dream_dest_color_03(i) - 0.05)
            .style("stroke-opacity", (d, i) => dream_dest_color_03(i) + 0.3)
            .style("stroke-width", (d, i) => dream_dest_color_03(i) + 0.3)
            .attr(
                "d",
                d3
                    .area()
                    .x((d, i) => dream_dest_x_03(d.data[0]))
                    .y0((d) => dream_dest_y_03(d[0] * dest_d_f_03))
                    .y1((d) => dream_dest_y_03(d[1] * dest_d_f_03))
                    .curve(d3.curveBasis)
            );

        dream_dest_area_chart_txt_03 = dream_dest_svg_03_real_dream
            .selectAll("text.dream-dest-area-chart-03-txt")
            .data(dream_dest_area_data_stack_conv_03)
            .join("text")
            .attr("class", (d, i) => `dream-dest-area-chart-03-txt`)
            .style("text-align", "center")
            .style("text-anchor", "middle")
            .style("alignment-baseline", "middle")
            .style("font-size", "10px")
            .text((d, i) => (d[7].data[1][i].dream_dest_migrants_avg * dest_d_f_03 > 30 ? d[7].data[1][i].orig : ""))
            .attr("x", (d, i) => dream_dest_x_03(2012.5))
            .attr("y", (d, i) => dream_dest_y_03(d[7][0] + ((d[7][1] - d[7][0]) / 2) * dest_d_f_03))
            .style("fill", dream_txt_col);

        dream_dest_area_chart_03
            .on("mousemove", function () {
                atooltip_wrapper_03.style("opacity", 1).style("visibility", "visible");

                // get secondary class
                let selected_country = d3.select(this).attr("class").split(" ")[1];
                let el_box = d3.select(this).node().getBBox();
                let x_country = el_box.x + el_box.width / 2;
                // x_country = event.clientX;
                let y_country = el_box.y + el_box.height / 2 - 10;
                // y_country = event.clientY;

                atooltip_country_03.text(iso_country_fun(selected_country));

                let maxSize = document.getElementById("atooltip_country_03").getComputedTextLength();

                atooltip_background_03
                    .transition()
                    .duration(100)
                    .attr("x", -0.5 * maxSize * 1.6)
                    .attr("width", maxSize * 1.6);

                atooltip_wrapper_03
                    .transition()
                    .duration(100)
                    .attr("transform", "translate(" + (x_country - maxSize * 0.5) + "," + y_country + ")")
                    .style("opacity", 1);

                // select path
                d3.select(`.dream-dest-area-chart-03.${selected_country}`).style("fill", "#87004f");
            })
            .on("mouseout", function () {
                atooltip_wrapper_03.style("opacity", 0).style("visibility", "hidden");

                // select path
                d3.selectAll(`.dream-dest-area-chart-03`).style("fill", dream_area_s_col);
            });
    };

    // svg_03_real_dream
    //=====< 5. Area Chart Lines & Axes >==========================================================>
    //=============================================================================================>
    //=============================================================================================>
    //=============================================================================================>
    // Chart Lines ---------------------------------------------------------------------------------
    // Lines
    const overlay_lines_03 = svg_03
        .selectAll("line.overlay-lines")
        .data([0, width_03 / 2 - 30, width_03 / 2 + 30, width_03])
        .join("line")
        .style("stroke", background_col)
        .style("stroke-width", 2)
        .attr("x1", (d) => d)
        .attr("y1", -20)
        .attr("x2", (d) => d)
        .attr("y2", height_03 + 20);
    // Chart Axes ----------------------------------------------------------------------------------
    // x-axis
    const real_area_x_axis_03 = svg_03
        .selectAll("text.real-area-x-axis-03")
        .data([2005, 2010, 2015, 2020])
        .join("text")
        .attr("class", (d, i) => `real-area-x-axis-03`)
        .style("text-align", "center")
        .style("text-anchor", "middle")
        .style("alignment-baseline", "middle")
        .style("font-size", "10px")
        .style("opacity", 0.7)
        .text((d, i) => d)
        .attr("x", (d, i) => real_orig_x_03(d))
        .attr("y", height_03 / 2)
        .style("fill", "grey");

    d3.select("text.real-area-x-axis-03").style("text-anchor", "start");
    d3.select(d3.selectAll("text.real-area-x-axis-03").nodes().reverse()[0]).style("text-anchor", "end");

    const dream_area_x_axis_03 = svg_03
        .selectAll("text.dream-area-x-axis-03")
        .data([2005, 2010, 2015, 2020])
        .join("text")
        .attr("class", (d, i) => `dream-area-x-axis-03`)
        .style("text-align", "center")
        .style("text-anchor", "middle")
        .style("alignment-baseline", "middle")
        .style("font-size", "10px")
        .style("opacity", 0.7)
        .text((d, i) => d)
        .attr("x", (d, i) => dream_orig_x_03(d))
        .attr("y", height_03 / 2)
        .style("fill", "grey");

    d3.select("text.dream-area-x-axis-03").style("text-anchor", "start");
    d3.select(d3.selectAll("text.dream-area-x-axis-03").nodes().reverse()[0]).style("text-anchor", "end");

    // y-axis
    real_orig_y_03 = d3
        .scaleLinear()
        .domain([0, 100])
        .range([height_03 / 2 - 25, 70]);

    dream_orig_y_03 = d3
        .scaleLinear()
        .domain([0, 100])
        .range([height_03 / 2 - 25, 70]);

    const out_area_y_axis_03 = svg_03
        .selectAll("text.out-area-y-axis")
        .data([0, 25, 50, 75, 100])
        .join("text")
        .attr("class", (d, i) => `out-area-y-axis`)
        .style("text-align", "center")
        .style("text-anchor", "middle")
        .style("alignment-baseline", "middle")
        .style("font-size", "10px")
        .style("opacity", 0.7)
        .text((d, i) => `- ${d}% -`)
        .attr("x", width_03 / 2)
        .attr("y", (d, i) => real_orig_y_03(d))
        .style("fill", "grey");

    // y-axis
    real_dest_y_03 = d3
        .scaleLinear()
        .domain([0, 100])
        .range([height_03 / 2 + 25, height_03 - 70]);

    dream_dest_y_03 = d3
        .scaleLinear()
        .domain([0, 100])
        .range([height_03 / 2 + 25, height_03 - 72]);

    const in_area_y_axis_03 = svg_03
        .selectAll("text.in-area-y-axis")
        .data([0, 25, 50, 75, 100])
        .join("text")
        .attr("class", (d, i) => `in-area-y-axis`)
        .style("text-align", "center")
        .style("text-anchor", "middle")
        .style("alignment-baseline", "middle")
        .style("font-size", "10px")
        .style("opacity", 0.7)
        .text((d, i) => `- ${d}% -`)
        .attr("x", width_03 / 2)
        .attr("y", (d, i) => real_dest_y_03(d))
        .style("fill", "grey");

    // annotations
    const area_annotation_03 = svg_03
        .append("g")
        .attr("class", (d, i) => `area-annotation`)
        .style("text-align", "center")
        .style("text-anchor", "middle")
        .style("alignment-baseline", "middle")
        .style("font-size", "14px")
        .style("opacity", 0.9)
        .style("fill", "grey")
        .each(function () {
            d3.select(this)
                .append("text")
                .attr("x", real_orig_x_03(2012.5))
                .attr("y", real_orig_y_03(140))
                .text("Reality")
                .style("font-size", "20px")
                .style("fill", real_area_s_col);
            d3.select(this)
                .append("text")
                .attr("x", dream_orig_x_03(2012.5))
                .attr("y", dream_orig_y_03(140))
                .text("Dream")
                .style("font-size", "20px")
                .style("fill", dream_area_s_col);

            d3.select(this).append("text").attr("x", real_orig_x_03(2012.5)).attr("y", real_orig_y_03(130)).text("Migrant's real flow");

            d3.select(this)
                .append("text")
                .attr("x", real_orig_x_03(2012.5))
                .attr("y", real_orig_y_03(130) + 20)
                .text("out of the country");

            d3.select(this)
                .append("text")
                .attr("x", real_dest_x_03(2012.5))
                .attr("y", real_dest_y_03(130) - 20)
                .text("Migrant's real flow");

            d3.select(this).append("text").attr("x", real_dest_x_03(2012.5)).attr("y", real_dest_y_03(130)).text("into the country");

            d3.select(this).append("text").attr("x", dream_orig_x_03(2012.5)).attr("y", dream_orig_y_03(130)).text("Migrant's dream flow");

            d3.select(this)
                .append("text")
                .attr("x", dream_orig_x_03(2012.5))
                .attr("y", dream_orig_y_03(130) + 20)
                .text("out of the country");

            d3.select(this)
                .append("text")
                .attr("x", dream_dest_x_03(2012.5))
                .attr("y", dream_dest_y_03(130) - 20)
                .text("Migrant's dream flow");

            d3.select(this).append("text").attr("x", dream_dest_x_03(2012.5)).attr("y", dream_dest_y_03(130)).text("into the country");

            // countries
            // d3.select(this)
            //     .append("text")
            //     .attr("x", real_orig_x_03(2012.5))
            //     .attr("y", real_orig_y_03(93))
            //     .style("font-size", "10px")
            //     .style("fill", real_txt_col)
            //     .text("Saudi Arabia");

            // d3.select(this)
            //     .append("text")
            //     .attr("x", real_orig_x_03(2012.5))
            //     .attr("y", real_orig_y_03(101))
            //     .style("font-size", "10px")
            //     .style("fill", real_txt_col)
            //     .text("Turkey");

            // d3.select(this)
            //     .append("text")
            //     .attr("x", dream_orig_x_03(2012.5))
            //     .attr("y", dream_orig_y_03(14))
            //     .style("font-size", "10px")
            //     .style("fill", dream_txt_col)
            //     .text("Germany");

            // d3.select(this)
            //     .append("text")
            //     .attr("x", dream_orig_x_03(2014))
            //     .attr("y", dream_orig_y_03(21))
            //     .style("font-size", "10px")
            //     .style("fill", dream_txt_col)
            //     .text("Canada");

            // d3.select(this)
            //     .append("text")
            //     .attr("x", dream_orig_x_03(2012.5))
            //     .attr("y", dream_orig_y_03(29))
            //     .style("font-size", "10px")
            //     .style("fill", dream_txt_col)
            //     .text("Australia");

            // d3.select(this)
            //     .append("text")
            //     .attr("x", width_03 / 2)
            //     .attr("y", -55)
            //     .style("font-size", "16px")
            //     .style("fill", "#6e6e6e")
            //     .text("United States");

            // d3.select(this)
            //     .append("text")
            //     .attr("x", width_03 / 2)
            //     .attr("y", -38)
            //     .style("font-size", "12px")
            //     .style("fill", "#6e6e6e")
            //     .style("opacity", 0.9)
            //     .text("Y2020");

            // d3.select(this)
            //     .append("line")
            //     .attr("x1", width_03 / 2 - 120)
            //     .attr("y1", -30)
            //     .attr("x2", width_03 / 2 + 120)
            //     .attr("y2", -30)
            //     .style("stroke", "white")
            //     .style("stroke-dasharray", "3 3")
            //     .style("stroke-width", 0.5);

            // d3.select(this)
            //     .append("circle")
            //     .attr("cx", width_03 / 2 - 120)
            //     .attr("cy", -30)
            //     .attr("r", 3)
            //     .style("fill", "#6e6e6e");

            // d3.select(this)
            //     .append("circle")
            //     .attr("cx", width_03 / 2 + 120)
            //     .attr("cy", -30)
            //     .attr("r", 3)
            //     .style("fill", "#6e6e6e");

            // d3.select(this)
            //     .append("text")
            //     .attr("x", width_03 / 2)
            //     .attr("y", -13)
            //     .style("font-size", "12px")
            //     .style("fill", "#6e6e6e")
            //     .text("Migrants in: 46.6m | Migrants out: 2.8m");
        });

    atooltip_wrapper_03.raise();

    //
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // 00. dropdown ///////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    var iso_c = "FIN";
    real_orig_area_chart_fun_03(iso_c);
    real_dest_area_chart_fun_03(iso_c);
    dream_orig_area_chart_fun_03(iso_c);
    dream_dest_area_chart_fun_03(iso_c);
}; // end of dataviz_03

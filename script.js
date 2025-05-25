let extractedText = "";
let graph = {};
let descriptions = {};
let node_names = [];
let node_pos = [];
let node_con = [];
let start_node_name = "";
let start_node_index = -1;
let rect = document.getElementById("canvas").getBoundingClientRect();
let width = rect.width;
let height = rect.height;
let node_radius = 20;
let initDescX  = -1;
let initDescY = -1;
let isMoving = false;
let descriptionBox = document.getElementById("descriptionContainer");
let descriptionHeader = document.getElementById("descriptionHeading");
let descriptionText = document.getElementById("descriptionText");

document.getElementById("uploadButton").addEventListener("click", function(){
  document.getElementById("file-upload").click();
});

document.getElementById("file-upload").addEventListener("change", async function() {
  descriptionBox.style.visibilty = "hidden";
  extractedText = "";
  graph = {};
  descriptions = {};
  node_names = [];
  node_pos = [];
  node_con = [];
  start_node_name = "";
  start_node_index = -1;

  const loadingOverlay = document.getElementById("loadingOverlay");
  const loadingProgress = document.getElementById("loadingProgress");
  loadingOverlay.style.display = "flex";

  try{
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 1;
      loadingProgress.style.width = `${progress}%`;
      
      if (progress >= 100) {
        clearInterval(progressInterval);
      }
    }, 200);

    const file = document.getElementById("file-upload").files[0];
    if(!file){
      return;
    }

    const fileType = file.name.split(".").pop().toLowerCase();

    if(fileType == "pdf"){
      extractedText = await extractPDF(file);
    }
    else{
      alert("Unsupported File Type.");
      return;
    }

    console.log("Selected File:", file);
    console.log("Extracted Text:",extractedText);
    const prompt = "read the following document and provide a 3-7 word description of the main topic, then divide that topic into as many subtopics as necessary, all of which also 3-7 words, and divide the subtopics into even more subtopics until it is not necessary for a subtopic to be divided, THE TOTAL NUMBER OF ITEMS IN THE ADJACENCY LIST MUST BE LESS THAN 60 BUT GREATER THAN 30, IF MORE THAN 60 ARE PROVIDED, CUT OUT EVERYTHING PAST THE 60TH ITEM structure the topics and subtopics as an adjacency list in js code, if a topic is off limits for you simply ignore it and continue creating the list, DO NOT SEPARATE A TOPIC FROM ITS SUBTOPICS IN THE LIST USING MULTIPLE LINES, A TOPIC MUST BE ON THE SAME LINE AS ALL OF ITS SUBTOPICS. Put all subtopics of a parent topic on the same line as the parent topic, do not put them on all separate lines. EVERY TOPIC AND SUBTOPIC EVER MENTIONED IN THE ADJACENCY LIST SHOULD HAVE ITS OWN LINE IN THE ADJACENCY LIST EVEN IF IT HAS AN EMPTY LIST OF SUBTOPICS. A NEW LINE IN THE ADJACENCY LIST SHOULD ONLY BE CREATED IF THE TOPIC IS A SUBTOPIC OF A PREVIOUS SUBTOPIC OR THE MAIN TOPIC. Additionally, create a dictionary containing EVERY single subtopic that was EVER MENTIONED in the adjacency list INCLUDING THE MAIN TOPIC and a corresponding 200-400 word extensive, extremely informative, expert level, explanation of that subtopic and its relation to its parent topic if it has one also in the same code format, and similarly, IMPORTANT: IF A TOPIC IS OFF LIMITS, JUST MOVE PAST IT AND DO NOT STOP THE RESPONSE AND CONTINUE CREATING THE LISTS, no comments, DO NOT MAKE ANY OF THE TOPICS, SUBTOPICS, OR DESCRIPTIONS HAVE ANY CHARACTERS OTHER THAN THOSE THAT ARE ALPHANUMERIC OR SPACES, make the name of the adjacency list adjacency_list and the name of the explanation list explanation_list, make it as python code, I need the adjacency_list like a graph structure, THE TOTAL NUMBER OF ITEMS IN THE ADJACENCY LIST MUST BE LESS THAN 60 AND GREATER THAN 30 AND THE TOTAL NUMBER OF ITEMS IN THE EXPLANATION LIST SHOULD ALSO BE LESS THAN 60 AND GREATER THAN 30 AND ALSO THE SAME NUMBER AS THE NUMBER IN THE ADJACENCY LIST, IF MORE THAN 60 ARE PROVIDED, CUT OUT EVERYTHING PAST THE 60TH ITEM, format it as the following format: \nadjacency_list = {\n\t\"topic\": [\"subtopic 1\", \"subtopic 2\", \"subtopic 3\"]\n\"subtopic 1\": [\"subsubtopic 1\", \"subsubtopic 2\"]\n...\n}\nexplanation_list = {\n\t\"topic\": \"explanation of topic\"\n\"subtopic 1\": \"explanation of subtopic 1\"\n...\n}";
    const result = await callGemini(prompt, extractedText);
    await generateSimulation(result);
  }
  catch (error){
    console.error("Error:",error);
    alert("Processing failed. Please try again.");
  }
  finally {
    loadingProgress.style.width = "100%";
    setTimeout(() => {
      loadingOverlay.style.display = "none";
    }, 500);
  }
});

document.getElementById("searchButton").addEventListener("click", async function(){
  let searchText = document.getElementById("textInput").value;
  if(searchText != ""){
    descriptionBox.style.visibilty = "hidden";
    graph = {};
    descriptions = {};
    node_names = [];
    node_pos = [];
    node_con = [];
    start_node_name = "";
    start_node_index = -1;

    const loadingOverlay = document.getElementById("loadingOverlay");
    const loadingProgress = document.getElementById("loadingProgress");
    loadingOverlay.style.display = "flex";

    try{
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 1;
        loadingProgress.style.width = `${progress}%`;
        
        if (progress >= 100) {
          clearInterval(progressInterval);
        }
      }, 200);

      const prompt = "for the following topic provided, divide that topic into as many subtopics as necessary, all of which 3-7 words, and divide the subtopics into even more subtopics until it is not necessary for a subtopic to be divided, THE TOTAL NUMBER OF ITEMS IN THE ADJACENCY LIST MUST BE LESS THAN 60 BUT GREATER THAN 30, IF MORE THAN 60 ARE PROVIDED, CUT OUT EVERYTHING PAST THE 60TH ITEM structure the topics and subtopics as an adjacency list in js code, if a topic is off limits for you simply ignore it and continue creating the list, DO NOT SEPARATE A TOPIC FROM ITS SUBTOPICS IN THE LIST USING MULTIPLE LINES, A TOPIC MUST BE ON THE SAME LINE AS ALL OF ITS SUBTOPICS. Put all subtopics of a parent topic on the same line as the parent topic, do not put them on all separate lines. EVERY TOPIC AND SUBTOPIC EVER MENTIONED IN THE ADJACENCY LIST SHOULD HAVE ITS OWN LINE IN THE ADJACENCY LIST EVEN IF IT HAS AN EMPTY LIST OF SUBTOPICS. A NEW LINE IN THE ADJACENCY LIST SHOULD ONLY BE CREATED IF THE TOPIC IS A SUBTOPIC OF A PREVIOUS SUBTOPIC OR THE MAIN TOPIC. Additionally, create a dictionary containing EVERY single subtopic that was EVER MENTIONED in the adjacency list INCLUDING THE MAIN TOPIC and a corresponding 200-400 word extensive, extremely informative, expert level, explanation of that subtopic and its relation to its parent topic if it has one also in the same code format, and similarly, IMPORTANT: IF A TOPIC IS OFF LIMITS, JUST MOVE PAST IT AND DO NOT STOP THE RESPONSE AND CONTINUE CREATING THE LISTS, no comments, DO NOT MAKE ANY OF THE TOPICS, SUBTOPICS, OR DESCRIPTIONS HAVE ANY CHARACTERS OTHER THAN THOSE THAT ARE ALPHANUMERIC OR SPACES, make the name of the adjacency list adjacency_list and the name of the explanation list explanation_list, make it as python code, I need the adjacency_list like a graph structure, THE TOTAL NUMBER OF ITEMS IN THE ADJACENCY LIST MUST BE LESS THAN 60 AND GREATER THAN 30 AND THE TOTAL NUMBER OF ITEMS IN THE EXPLANATION LIST SHOULD ALSO BE LESS THAN 60 AND GREATER THAN 30 AND ALSO THE SAME NUMBER AS THE NUMBER IN THE ADJACENCY LIST, IF MORE THAN 60 ARE PROVIDED, CUT OUT EVERYTHING PAST THE 60TH ITEM, format it as the following format: \nadjacency_list = {\n\t\"topic\": [\"subtopic 1\", \"subtopic 2\", \"subtopic 3\"]\n\"subtopic 1\": [\"subsubtopic 1\", \"subsubtopic 2\"]\n...\n}\nexplanation_list = {\n\t\"topic\": \"explanation of topic\"\n\"subtopic 1\": \"explanation of subtopic 1\"\n...\n}";
      const result = await callGemini(prompt, searchText);
      await generateSimulation(result);
    }
    catch (error){
      console.error("Error:",error);
      alert("Processing failed. Please try again.");
    }
    finally {
      loadingProgress.style.width = "100%";
      setTimeout(() => {
        loadingOverlay.style.display = "none";
      }, 500);
    }
  }
});

async function generateSimulation(result){
  console.log(result.response);
  createGraphData(result.response);
  console.log("graph:",graph);
  console.log("descriptions:",descriptions);

  for(let u in graph){
    if(!node_names.includes(u)){
      node_names.push(u);
    }
    for(let v of graph[u]){
      if(!node_names.includes(v)){
        node_names.push(v);
      }
    }
  }

  let isStart = []; 
  for(let i = 0; i < node_names.length; i++){
    isStart.push(true);
  }

  for(let u in graph){
    console.log(u);
    console.log(graph[u]);
    for(let v of graph[u]){
      console.log(v);
      console.log(node_names.indexOf(v));
      isStart[node_names.indexOf(v)] = false;
    }
  }

  for(let i = 0; i < node_names.length; i++){
    if(isStart[i]){
      start_node_name = node_names[i];
      start_node_index = i;
    }
  }

  console.log(node_names);
  console.log(isStart);
  console.log(start_node_name);
  console.log(start_node_index);

  for(let i = 0; i < node_names.length; i++){
    node_pos.push({x: width/2, y: height/2, r: node_radius, depth: 0});
    node_con.push({source: -1, target: []});
  }
  
  dfs(node_names[0], node_names[0], 0);
  console.log("dfs complete");

  initSimulation();
}
descriptionBox.addEventListener("mousedown", (e) => {
  console.log(window.getComputedStyle(descriptionBox).visbility);
  if(window.getComputedStyle(descriptionBox).visbility != "hidden"){
    initDescX = e.clientX;
    initDescY = e.clientY;
    isMoving = true;
  }
});

descriptionBox.addEventListener("mousemove", (e) => {
  if(isMoving && window.getComputedStyle(descriptionBox).visbility != "hidden"){
    descriptionBox.style.top = descriptionBox.offsetTop - (initDescY - e.clientY) + "px";
    descriptionBox.style.left = descriptionBox.offsetLeft - (initDescX - e.clientX) + "px";
    initDescX = e.clientX;
    initDescY = e.clientY;
  }
});

descriptionBox.addEventListener("mouseup", (e) => {
  if(window.getComputedStyle(descriptionBox).visbility != "hidden"){
    isMoving = false;
  }
});

descriptionBox.addEventListener("mouseleave", (e) => {
  if(window.getComputedStyle(descriptionBox).visbility != "hidden"){
    isMoving = false;
  }
});

document.getElementById("closeButton").addEventListener("click", function(){
  descriptionBox.style.visibility = "hidden";
});

function dfs(current, parent, depth){
  console.log("current:", current);
  console.log("parent:", parent);
  node_con[node_names.indexOf(current)].source = node_names.indexOf(parent);
  console.log("hello1");
  node_pos[node_names.indexOf(current)].depth = depth;
  console.log("hello2");
  if(!(graph[current] === undefined)){
    console.log(graph[current]);
    for(let next of graph[current]){
      console.log(next);
      node_con[node_names.indexOf(current)].target.push(next);
      dfs(next, current, depth + 1);
    }
  }
}

function initSimulation() {
  const maxDepth = Math.max(...node_pos.map(d => d.depth || 0));
  const colorScale = d3.scaleLinear()
    .domain([0, maxDepth])
    .range(["#00c8ff", "#01485c"]);
  console.log("hi1");

  let nodes = node_names.map((name, i) => ({
    id: i,
    name: name,
    x: node_pos[i].x,
    y: node_pos[i].y,
    r: node_radius,
    depth: node_pos[i].depth || 0,
    color: colorScale(node_pos[i].depth || 0),
    isRoot: node_pos[i].depth == 0
  }));

  console.log("hi2");

  const rootNode = nodes.find(node => node.isRoot);
  
  let links = [];
  node_con.forEach((con, i) => {
    if (con.source !== -1) {
      links.push({
        source: con.source,
        target: i,
        strength: 0.5
      });
    }
  });
  
  if (window.simulation) {
    window.simulation.stop();
  }
  
  const svg = d3.select("#canvas")
    .html("")
    .append("svg")
    .attr("width", width)
    .attr("height", height);
  
  window.simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id))
    .force("collide", d3.forceCollide().radius(d => d.r + 10).strength(1))
    .force("charge", d3.forceManyBody().strength(-100))
    .force("center", d3.forceCenter(width/2, height/2))
    .force("rootForce", () => {
      if (rootNode) {
        rootNode.x = width/2;
        rootNode.y = height/2;
      }
    })
    .force("x", d3.forceX(width/2).strength(0.025))
    .force("y", d3.forceY(height/2).strength(0.025))
    .on("tick", () => {
      nodes.forEach(node => {
          node.x = Math.max(node.r, Math.min(width - node.r, node.x));
          node.y = Math.max(node.r, Math.min(height - node.r, node.y));
        });

      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);
      
      node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
      
      label.attr("transform", d => `translate(${d.x},${d.y})`)
    });
  
  const link = svg.append("g")
    .selectAll("line")
    .data(links)
    .enter().append("line")
    .attr("stroke", "#999")
    .attr("stroke-width", 1.5);
  
  const node = svg.append("g")
    .selectAll("circle")
    .data(nodes)
    .enter().append("circle")
    .attr("r", d => d.r)
    .attr("fill", d => d.color)
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended))
    .on("mouseover", function(event, d) {
      d3.select(event.currentTarget)
        .attr("stroke", "black")
        .attr("stroke-width", 2);
      label.filter(dd => dd.id === d.id).style("visibility", "visible").raise();
    })
    .on("mouseout", function(event, d) {
      d3.select(event.currentTarget)
        .attr("stroke", null);
      label.filter(dd => dd.id === d.id).style("visibility", "hidden");
    })
    .on("click", function(event, d) {
      descriptionBox.style.visibility = "visible";
      descriptionBox.style.opacity = "1";
      setTimeout(() => {
        descriptionBox.style.opacity = "0.5";
      }, 1000);
      descriptionHeader.textContent = node_names[d.id];
      descriptionText.textContent = descriptions[node_names[d.id]] || "No Description Available";
    })
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));
  
  const fontSize = "18px";
  const fontFamily = "Outfit";
  const padding = 10;
  const verticalPadding = 5; 

  const label = svg.append("g")
    .selectAll("g")
    .data(nodes)
    .enter().append("g")
    .style("visibility", "hidden")
    .attr("transform", d => `translate(${d.x},${d.y})`);

  const textMeasure = document.createElement("canvas");
  const ctx = textMeasure.getContext("2d");
  ctx.font = `${fontSize} ${fontFamily}`;

  label.each(function(d) {
    const textWidth = ctx.measureText(d.name).width;
    const bboxWidth = textWidth + padding * 2;
    const bboxHeight = parseInt(fontSize) + verticalPadding * 2;
    
    d3.select(this)
      .append("rect")
      .attr("x", -bboxWidth/2)
      .attr("y", -bboxHeight - 5)
      .attr("width", bboxWidth)
      .attr("height", bboxHeight)
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("fill", "white")
      .attr("stroke", "#aaa")
      .attr("stroke-width", 1);
    
    d3.select(this)
      .append("text")
      .attr("dy", -bboxHeight/2 - 5 + parseInt(fontSize)/3)
      .text(d.name)
      .style("font-size", fontSize)
      .style("font-family", fontFamily)
      .style("text-anchor", "middle")
      .style("pointer-events", "none");
  });
  
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
  
  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }
  
  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
  
}

function createGraphData(response){
  let adjacency_plaintext = response.substring(response.indexOf("adjacency_list = {"), response.indexOf("}")+1);
  let explanation_plaintext = response.substring(response.indexOf("explanation_list = {"), response.lastIndexOf("}")+1);
  console.log(adjacency_plaintext);                                                     
  console.log(explanation_plaintext);
  
  let adjacency_split = adjacency_plaintext.split("\n");
  for(let i = 1; i < adjacency_split.length-1; i++){
    let line = [];
    let cur = "";
    let adding = false;
    for(let j = 0; j < adjacency_split[i].length; j++){
      if(adding && adjacency_split[i][j] != "\""){
        cur += adjacency_split[i][j];
      }
      if(adjacency_split[i][j] == "\""){
        adding = !adding;

        if(!adding){
          line.push(cur);
          cur = "";
        }
      }
    }
    console.log(line);
    if(line.length == 1){
      graph[line[0]] = [];
    }
    else{
      graph[line[0]] = line.slice(1);
    }
  }

  let explanation_split = explanation_plaintext.split("\n");
  for(let i = 1; i < explanation_split.length-1; i++){
    let line = [];
    let cur = "";
    let adding = false;
    for(let j = 0; j < explanation_split[i].length; j++){
      if(adding && explanation_split[i][j] != "\""){
        cur += explanation_split[i][j];
      }
      if(explanation_split[i][j] == "\""){
        adding = !adding;

        if(!adding){
          line.push(cur);
          cur = "";
        }
      }
    }
    console.log(line);
    descriptions[line[0]] = line[1];
  }
}

async function extractPDF(file){
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
  let text = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map(item => item.str).join(" ");
  }

  return text;
}

async function callGemini(prompt, text) {
  try {
    const response = await fetch("http://localhost:3000/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, text }),
    });
    if (!response.ok) {
      const errorData = await response.json(); 
      console.error("Backend error:", errorData);
      throw new Error(errorData.error || "API request failed");
    }
    return await response.json();
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
}


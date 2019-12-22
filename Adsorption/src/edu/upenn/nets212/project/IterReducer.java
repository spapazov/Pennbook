package edu.upenn.nets212.project;

import java.util.HashMap;
import java.util.Map;

import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Reducer;
import org.apache.hadoop.mapreduce.Reducer.Context;

public class IterReducer extends Reducer<Text, Text, Text, Text> {
	//input: <node, "label:1 ; outboundNodes:weight separated by spaces">
	//input: <outboundNode, label:labelweight>
	
	//updates labels + label weights
	//normalize origin nodes with their labels with weight 1
	
	//output: <node, "label:1 ; outboundNodes:weight separated by spaces">
	@Override
	public void reduce(Text key, Iterable<Text> values, Context context) throws java.io.IOException, InterruptedException {
		
		String node = key.toString();
		
		HashMap<String,Double> newLabelsMap = new HashMap<String,Double>();
		String outboundNodesAndWeight = "";
		
		for (Text value: values) {
			
			String line = value.toString();
			
			//if value.contains(";") means its the (node, label+outboundNodes+weight) tuple
			//required to retain information
			//extracts adjacency list + weight which remains unchanged
			if (line.contains(";")) {
				String labelOutboundNodesWeight = line;
				String[] labelOutboundNodesWeightList = labelOutboundNodesWeight.split(";");
		        outboundNodesAndWeight = labelOutboundNodesWeightList[1];
			} 
			//else its the (outboundNode, label:labelWeight) tuple
			//extracts and constructs new list of labels
			else {

				String label = line;
			
				//if its not a node with the origin label
				//add the label
				//this prevents adding a duplicate origin label as it needs to be normalized later
				if (!(!node.startsWith("(") && label.startsWith(node))) {
					
					String[] labelList = label.split(":");
					String labelName = labelList[0];
					double labelWeight = Double.parseDouble(labelList[1]);
					
					//sums up the weight of the same labels
					if (newLabelsMap.containsKey(labelName)) {
						newLabelsMap.put(labelName, newLabelsMap.get(labelName) + labelWeight);
					} else {
						newLabelsMap.put(labelName, labelWeight);
					}
					
					
				}
			}	
		}
		//normalizes weight of labels with origin nodes to 1
		if (!node.startsWith("(")){
			newLabelsMap.put(node, 1d);
		} 
		
		String output = "";
		
		//prints all content from map
		for (Map.Entry<String, Double> label : newLabelsMap.entrySet()) {
			output += label.getKey() + ":" + label.getValue() + " ";
		}
		
		output += " ;" + outboundNodesAndWeight;
		
		context.write(key, new Text(output));
	}

}

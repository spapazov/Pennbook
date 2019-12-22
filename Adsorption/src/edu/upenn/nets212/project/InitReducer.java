package edu.upenn.nets212.project;

import java.util.ArrayList;

import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Reducer;
import org.apache.hadoop.mapreduce.Reducer.Context;


public class InitReducer extends Reducer<Text, Text, Text, Text> {
	
	//<node, singleOutboundNode>
	//output: <node, "label:1 ; outboundNodes:weight separated by spaces">
	@Override
	public void reduce(Text key, Iterable<Text> values, Context context) throws java.io.IOException, InterruptedException {
		
		//1 is the default rank for each node
		String outboundNodesAndWeight = "";
		String node = key.toString();
		
		double noOutboundNodes = 0;
		ArrayList<String> outboundNodes = new ArrayList<String>();
		
		//counts number of nodes
		for (Text value: values) {	
			noOutboundNodes += 1;	
			String outboundNode = value.toString();
			outboundNodes.add(outboundNode);
		}
		
		//calculates equal weight edges
		double weight = 1/noOutboundNodes;
		
		for (String outboundNode: outboundNodes) {	
			
			outboundNodesAndWeight += outboundNode + ":" + weight + " ";
		}
		
		String labelOutboundNodesWeight;
		//only add labels to user nodes
		if (node.startsWith("(")) {
			labelOutboundNodesWeight = "noLabels;" + outboundNodesAndWeight;
		} else {
			labelOutboundNodesWeight = node + ":1" + " ;" + outboundNodesAndWeight;
		}
		
		//output: <node, "label:1 ; outboundNodes:weight separated by spaces">
		context.write(key, new Text(labelOutboundNodesWeight));
		
	}
}

package edu.upenn.nets212.project;

import java.io.IOException;

import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Mapper;

public class IterMapper extends Mapper<LongWritable, Text, Text, Text> {
	//input: <node, "label:labelWeights ; outboundNodes:weight separated by spaces">
	
	//output: <node, "label:labelWeights ; outboundNodes:weight separated by spaces">
	//output: <outboundNode, label:labelweight>
	@Override
	public void map(LongWritable key, Text value, Context context) throws IOException, InterruptedException {
		
		
		String line = value.toString();
		String [] lines = line.split("\t");
		String node = lines[0];
		String labelOutboundNodesWeight = lines[1];
		
		System.out.println("node: " + node + ".");
		System.out.println("labelOutboundNodesWeight: " + labelOutboundNodesWeight + ".");
		
        String[] labelOutboundNodesWeightList = labelOutboundNodesWeight.split(";");
        String[] labels = labelOutboundNodesWeightList[0].split(" ");
        String[] outboundNodesAndWeight = labelOutboundNodesWeightList[1].split(" ");
        
        //emit adjacencyList
        context.write(new Text(node), new Text(labelOutboundNodesWeight));
        
        for (String label: labels) {
        	
        	//in the first round
        	//attributes have no Labels and do not need to propogate anything
        	if (!label.equals("noLabels")) {

                String[] labelList = label.split(":");
   
                String labelName = labelList[0];
                double labelWeight = Double.parseDouble(labelList[1]);
                
                	for (String outboundNodeAndWeight: outboundNodesAndWeight) {

	                    String[] outboundNodesAndWeightList = outboundNodeAndWeight.split(":");
	                    String outboundNode = outboundNodesAndWeightList[0];
	                    double edgeWeight = Double.parseDouble(outboundNodesAndWeightList[1]);
	
	                    double propogateValue = labelWeight*edgeWeight;
	
	                    //emit <outboundNode, label:labelweight>
	                    String outputValue = labelName + ":" + String.valueOf(propogateValue);
	                    System.out.println(outboundNode + " , " + outputValue);
	                    context.write(new Text(outboundNode), new Text(outputValue));
                }
        	}
                

                
        	

        }
		
		
		
	}

}

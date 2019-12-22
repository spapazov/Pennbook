package edu.upenn.nets212.project;

import java.util.ArrayList;

import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Reducer;
import org.apache.hadoop.mapreduce.Reducer.Context;

public class DiffReducer extends Reducer<Text, Text, Text, Text> {
	
	
	// Zoe	Zoe:1.0 Daniel:0.7479073669010918 Stefan:1.3691735733347152
	//computes absolute difference between the labelWeight values of each node
	
	//input: <node, [labels:labelWeights]>
	//output: <node, difference_in_labelWeights>
	
	//node:Daniel
	//value:
	//Iris:0.483642578125 Zoe:0.7392578125 Stefan:1.2059326171875 Daniel:1.0 Maria:0.56689453125
	//Iris:0.42919921875 Zoe:0.67822265625 Stefan:1.12255859375 Daniel:1.0 Maria:0.42578125 
	@Override
	public void reduce(Text key, Iterable<Text> values, Context context) throws java.io.IOException, InterruptedException {
		ArrayList<String[]> output1AndOutput2 = new ArrayList<String[]>();
		
		for (Text value: values) {
			String label = value.toString();
			
			String[] labels = label.split(" ");
			
			output1AndOutput2.add(labels);
			//String labelName = labelList[0];
			//double labelWeight = Double.parseDouble(labelList[1]);
			
		}
		
		//calculate abs difference
		if (output1AndOutput2.size() > 1) {
			
			String label1 = output1AndOutput2.get(0)[0]; //[0] gets the first label
			String label2 = output1AndOutput2.get(1)[0]; 
			
			String[] labelList1 = label1.split(":");
			String labelName1 = labelList1[0];
			double labelWeight1 = Double.parseDouble(labelList1[1]);
			
			String[] labelList2 = label2.split(":");
			String labelName2 = labelList2[0];
			double labelWeight2 = Double.parseDouble(labelList2[1]);
			
			if (labelName1.equals(labelName2)) {
				double diff = Math.abs(labelWeight1 - labelWeight2);
				context.write(key, new Text(String.valueOf(diff)));
			}
			
		}
		
		
	}
}

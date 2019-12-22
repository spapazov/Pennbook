import { Component, OnInit } from '@angular/core';
import { VisualizerService } from "./service/visualizer.service";

@Component({
  selector: 'app-visualizer',
  templateUrl: './visualizer.component.html',
  styleUrls: ['./visualizer.component.css'],
})

export class VisualizerComponent implements OnInit {

  nodes:any = [];
  links:any = [];

  constructor(public service: VisualizerService) { }

  ngOnInit() {
    this.load(null);
  }

  nodeClicked(id) {
    this.load(id);
  }

  load(selected) {
    this.service.getGraph(selected).subscribe(
      res => {
          this.nodes = [...res.result.nodes];
          this.links = [...res.result.links];
      },
      err => {
        console.error(err);
      }
    )
  }
}

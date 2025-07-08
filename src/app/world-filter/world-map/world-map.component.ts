import { CommonModule } from '@angular/common';
import {
  Component,
  effect,
  ElementRef,
  inject,
  input,
  Input,
  output,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { PopoverModule } from 'primeng/popover';

import * as d3 from 'd3';

import { BehaviorSubject, of, switchMap, tap } from 'rxjs';
import { RadioBrowserApi } from '../../../services/radio-browser/radio-browser-api.model';
import { RadioBrowserApiService } from '../../../services/radio-browser/radio-browser-api.service';
import { LoaderComponent } from '../../../shared/loader/loader.component';
import { convert2CodeTo3Code, convert3CodeTo2Code } from './3code2code';

@Component({
  selector: 'app-world-map',
  imports: [
    CommonModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    DialogModule,
    PopoverModule,
    LoaderComponent,
  ],
  templateUrl: './world-map.component.html',
  styleUrl: './world-map.component.scss',
})
export class WorldMapComponent {
  @ViewChild('mapContainer') mapContainer!: ElementRef;

  @Input({ required: true }) countryList!: RadioBrowserApi.Country[];
  hoveredCountry = input.required<RadioBrowserApi.Country | null>();
  selectedCountry = input.required<RadioBrowserApi.Country | null>();

  @ViewChild('worldMap') worldMap!: ElementRef;

  private zoom: any;

  projection = d3.geoNaturalEarth1();
  pathGenerator = d3.geoPath(this.projection) as any;
  svg: any;
  g: any;

  constructor() {
    effect(() => {
      document.querySelectorAll('.country').forEach((country) => {
        country.classList.remove('hovered');
      });
      if (this.hoveredCountry()) {
        document
          .querySelector(`[data-code="${this.hoveredCountry()!.iso_3166_1}"]`)
          ?.classList.add('hovered');
      }
    });

    effect(() => {
      document.querySelectorAll('.country').forEach((country) => {
        country.classList.remove('selected');
      });

      if (this.selectedCountry()) {
        const d = this.jsonData.features.find(
          (c: any) =>
            c.id === convert2CodeTo3Code(this.selectedCountry()!.iso_3166_1)
        );

        if (d) {
          document
            .querySelector(
              `[data-code="${this.selectedCountry()!.iso_3166_1}"]`
            )
            ?.classList.add('selected');

          this.countryCodeSubject.next(convert3CodeTo2Code(d.id) ?? null);

          const [[x0, y0], [x1, y1]] = this.pathGenerator.bounds(d);
          const svgNode = this.svg.node() as SVGSVGElement;
          if (!svgNode) return;
          const { width, height } = svgNode.getBoundingClientRect();
          const scale = 0.7 / Math.max((x1 - x0) / width, (y1 - y0) / height);
          const translate = [
            width / 2 - (scale * (x0 + x1)) / 2,
            height / 2 - (scale * (y0 + y1)) / 2,
          ];
          this.svg
            .transition()
            .duration(750)
            .call(
              this.zoom.transform,
              d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
            );
        } else {
          // Zoom out to default view (reset zoom transform)

          this.svg
            .transition()
            .duration(750)
            .call(this.zoom.transform, d3.zoomIdentity.scale(1.2));
        }
      }
    });
  }

  jsonData: any;

  @ViewChild('worldMap', { static: true })
  myDataviz!: ElementRef<SVGSVGElement>;

  ngAfterViewInit() {
    const svg = d3.select(this.myDataviz.nativeElement);

    this.svg = svg;
    const g = svg.append('g');
    this.g = g;

    // Set up d3.zoom and store the instance
    this.zoom = d3.zoom().on('zoom', (event) => {
      g.attr('transform', event.transform);
    });
    svg.call(this.zoom as any);

    if (!svg) {
      return;
    }

    const self = this;

    d3.json(
      'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson'
    ).then((data: any) => {
      this.jsonData = data;

      g.selectAll('path')
        .data(data.features)
        .enter()
        .append('path')
        .attr('class', 'country')
        .attr('fill', '#69b3a2')
        .attr('d', this.pathGenerator)
        .attr('data-code', (d: any) => {
          return convert3CodeTo2Code(d.id) ?? '';
        })
        .style('stroke', '#fff')
        .on('click', (event, d: any) => {
          self.removeStations();
          const country = self.countryList.find(
            (c) => c.iso_3166_1 === convert3CodeTo2Code(d.id)
          );

          self.onSelectedCountry.emit(country!);
          self.countryCodeSubject.next(convert3CodeTo2Code(d.id) ?? null);

          // Responsive zoom to country
          const [[x0, y0], [x1, y1]] = this.pathGenerator.bounds(d);
          const svgNode = svg.node() as SVGSVGElement;
          if (!svgNode) return;
          const { width, height } = svgNode.getBoundingClientRect();
          const scale = 0.7 / Math.max((x1 - x0) / width, (y1 - y0) / height);
          const translate = [
            width / 2 - (scale * (x0 + x1)) / 2,
            height / 2 - (scale * (y0 + y1)) / 2,
          ];
          svg
            .transition()
            .duration(750)
            .call(
              this.zoom.transform,
              d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
            );
        });
    });

    this.stations$.subscribe((stations) => {
      this.loadingSubject.next(false);
      self.removeStations();
      self.addStations(stations);
    });
  }

  removeStations() {
    this.g.selectAll('g.station-group').remove();
  }

  addStations(stations: RadioBrowserApi.Station[]) {
    const self = this;
    const stationGroups: any[] = [];
    this.g
      .selectAll('g.station-group')
      .data(
        stations.filter(
          (s) => typeof s.geo_lat === 'number' && typeof s.geo_long === 'number'
        )
      )
      .enter()
      .append('g')
      .attr('class', 'station-group')
      .each(function (this: any, s: RadioBrowserApi.Station, i: number) {
        const coords = self.projection([s.geo_long, s.geo_lat]);
        if (!coords) return;

        // Ripple circle
        const ripple = d3
          .select(this)
          .append('circle')
          .attr('class', 'station-ripple')
          .attr('cx', coords[0])
          .attr('cy', coords[1])
          .attr('r', 0)
          .attr('fill', 'none')
          .attr('stroke', 'red')
          .attr('stroke-width', 0.1)
          .style('display', 'none');

        // Dot circle
        d3.select(this)
          .append('circle')
          .attr('class', 'station-dot')
          .attr('cx', coords[0])
          .attr('cy', coords[1])
          .attr('r', 0.2)
          .attr('fill', 'red');

        // Store reference for later
        stationGroups.push({ ripple });
      });

    function triggerRipples() {
      const total = stationGroups.length;
      const count = Math.max(1, Math.floor(total * 0.2));
      const indices = d3.shuffle(d3.range(total)).slice(0, count);
      indices.forEach((idx) => {
        const ripple = stationGroups[idx].ripple;
        ripple
          .interrupt()
          .attr('r', 0)
          .attr('opacity', 0.5)
          .style('display', '')
          .transition()
          .duration(2000)
          .attr('r', 3)
          .attr('opacity', 0)
          .on('end', function () {
            ripple.style('display', 'none');
          });
      });
      setTimeout(triggerRipples, Math.random() * 2000 + 1000);
    }
    triggerRipples();
  }

  radioBrowserService = inject(RadioBrowserApiService);

  countryCodeSubject = new BehaviorSubject<string | null>(null);
  countryCode$ = this.countryCodeSubject.asObservable();

  countryStationsCountSubject = new BehaviorSubject<number>(0);
  countryStationsCount$ = this.countryStationsCountSubject.asObservable();

  stations$ = this.countryCode$.pipe(
    switchMap((countryCode) => {
      this.loadingSubject.next(true);
      if (!countryCode) {
        return of([]);
      }

      return this.radioBrowserService.getStationsByCountryCode$(
        countryCode.toLowerCase()
      );
    }),
    tap((stations) => {
      this.countryStationsCountSubject.next(stations.length);
      this.stationsList = stations;
    })
  );

  loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  stationsList: RadioBrowserApi.Station[] = [];

  onSelectedCountry = output<RadioBrowserApi.Country>();
  onSelectedStations = output<RadioBrowserApi.Station[]>();

  selectStations() {
    this.onSelectedStations.emit(this.stationsList);
  }
}

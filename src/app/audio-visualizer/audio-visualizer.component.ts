import { CommonModule } from '@angular/common';
import {
  Component,
  effect,
  HostListener,
  inject,
  input,
  linkedSignal,
  signal,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import AudioMotionAnalyzer from 'audiomotion-analyzer';
import { ButtonModule } from 'primeng/button';
import { SliderModule } from 'primeng/slider';

import { TooltipModule } from 'primeng/tooltip';
import { Palette } from '../../services/vibrant.model';
import { CustomSliderComponent } from '../../shared/custom-slider/custom-slider.component';

import { ChipModule } from 'primeng/chip';
import { PopoverModule } from 'primeng/popover';
import { CacheService } from '../../services/cache.service';
import { RadioBrowserStation } from '../../services/radio-browser/radio-browser-api.model';
import { SidebarService } from '../../services/sidebar.service';
import { FavoritesService } from '../favorites/favorites.service';

@Component({
  selector: 'audio-visualizer',
  imports: [
    CommonModule,
    ButtonModule,
    SliderModule,
    FormsModule,
    TooltipModule,
    CustomSliderComponent,
    PopoverModule,
    ChipModule,
  ],
  templateUrl: './audio-visualizer.component.html',
  styleUrl: './audio-visualizer.component.scss',
})
export class AudioVisualizerComponent {
  selectedStation = input.required<RadioBrowserStation>();
  palette = input.required<Palette | null>();

  audioElement: HTMLMediaElement | null = null;
  containerElement: HTMLDivElement | null = null;
  audioMotion: AudioMotionAnalyzer | null = null;

  @ViewChild('thumbnail') thumbnailImage!: HTMLImageElement;

  sidebarService = inject(SidebarService);

  isFavorite = signal(false);

  constructor(private favoritesService: FavoritesService) {
    effect(() => {
      const imageHasError = !!!this.palette();

      const thumb = document.getElementById(
        'thumbnailImage'
      ) as HTMLImageElement;
      if (thumb && imageHasError) thumb.style.display = 'none';
      if (thumb && !imageHasError) thumb.style.display = 'block';
    });
    effect(() => {
      const palette = this.palette();

      if (!this.audioMotion) {
        this.initializeAudioMotion();
        this.watchAudioElementResize();
      }

      this.changeAudioMotionColor(palette);
    });
  }

  toggleFavorite() {
    this.isFavorite.update((isFavorite) => {
      if (isFavorite) {
        this.favoritesService.removeFavorite(this.selectedStation()!);
      } else {
        this.favoritesService.addFavorite(this.selectedStation()!);
      }
      return !isFavorite;
    });
  }

  ngAfterViewInit() {
    const palette = this.palette();

    if (!this.audioMotion) {
      this.initializeAudioMotion();
      this.watchAudioElementResize();
    }

    this.changeAudioMotionColor(palette);

    this.onVolumeChange(this.volume());
  }

  private changeAudioMotionColor(palette: Palette | null) {
    if (!this.audioMotion) return;

    let gradientLeft = 'orangered';
    let gradientRight = 'steelblue';
    if (palette?.DarkVibrant?.hex) {
      this.audioMotion.registerGradient('customGradientLeft', {
        colorStops: [palette?.DarkVibrant?.hex],
      });
      gradientLeft = 'customGradientLeft';
    }

    if (palette?.Vibrant?.hex) {
      this.audioMotion.registerGradient('customGradientRight', {
        colorStops: [palette?.Vibrant?.hex],
      });
      gradientRight = 'customGradientRight';
    }

    this.audioMotion.setOptions({
      gradientLeft,
      gradientRight,
    });
  }

  private watchAudioElementResize() {
    if (!this.containerElement) return;
    const ro = new ResizeObserver(() => {
      const width = window.innerWidth;
      const height = window.innerHeight - 300;

      this.audioMotion!.setCanvasSize(width, height);
    });
    ro.observe(this.containerElement!);
  }

  private initializeAudioMotion() {
    this.audioElement = document.getElementById('audio') as HTMLMediaElement;

    this.containerElement = document.getElementById(
      'container'
    ) as HTMLDivElement;

    if (!this.audioElement || !this.containerElement) return;

    this.audioMotion = new AudioMotionAnalyzer(this.containerElement, {
      source: this.audioElement,
      width: this.containerElement.parentElement!.clientWidth,
      height: this.containerElement.parentElement!.clientHeight,
      outlineBars: true,
      ansiBands: false,
      showScaleX: false,
      bgAlpha: 0,
      overlay: true,
      smoothing: 0.5,
      mode: 10,
      channelLayout: 'dual-combined',
      fillAlpha: 0.25,
      frequencyScale: 'bark',
      gradientLeft: 'orangered',
      gradientRight: 'steelblue',
      linearAmplitude: true,
      linearBoost: 1.8,
      lineWidth: 1.5,
      mirror: -1,
      reflexAlpha: 1,
      reflexBright: 1,
      reflexRatio: 0.5,
      showPeaks: false,
      weightingFilter: 'D',
    });
  }

  simpleUrl(url: string): string {
    // Remove the protocol (http:// or https://) and any trailing slashes
    return url.replace(/(^\w+:|^)\/\/(www\.)?/, '').replace(/\/.*$/, '');
  }

  isPlaying = linkedSignal(() => {
    const station = this.selectedStation();
    return false;
  });

  cacheService = inject(CacheService);
  volume = signal<number>(this.cacheService.get('volume') ?? 100);

  get volumeState() {
    if (this.volume() == 0) {
      return 0;
    }
    if (this.volume() <= 50) {
      return 1;
    }

    return 2;
  }

  onVolumeChange(value: number) {
    this.cacheService.set('volume', value);
    if (this.audioElement) this.audioElement.volume = Math.pow(value / 100, 2);
  }

  togglePlay() {
    if (!this.audioElement || !this.selectedStation()) {
      return;
    }
    if (this.audioElement.paused) {
      this.isPlaying.set(true);
      this.audioElement.play();
    } else {
      this.isPlaying.set(false);
      this.audioElement.pause();
    }
  }

  onBack() {
    this.sidebarService.onPreviousStation();
  }
  onForward() {
    this.sidebarService.onNextStation();
  }

  visitHomepage(station: RadioBrowserStation) {
    window.open(station.homepage, '_blank');
  }

  onShare(station: RadioBrowserStation) {
    const shareData = {
      title: station.name,
      text: `Listen to ${station.name} on Radio Station App`,
      url: station.url_resolved,
    };

    if (navigator.share) {
      navigator
        .share(shareData)
        .then(() => {})
        .catch((error) => {});
    } else {
      navigator.clipboard.writeText(station.url_resolved).then(
        () => {},
        (err) => {}
      );
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    const target = event.target as HTMLElement;
    const isInput =
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable;

    if (isInput) return;

    if (
      event.code === 'Space' ||
      event.key === ' ' ||
      event.key === 'Spacebar'
    ) {
      event.preventDefault();
      this.togglePlay();
    }
  }
}

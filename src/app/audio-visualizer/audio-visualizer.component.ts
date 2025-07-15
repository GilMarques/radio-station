import { CommonModule } from '@angular/common';
import {
  Component,
  effect,
  ElementRef,
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

import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ChipModule } from 'primeng/chip';
import { DrawerModule } from 'primeng/drawer';
import { MenuModule } from 'primeng/menu';
import { PopoverModule } from 'primeng/popover';
import { Subscription } from 'rxjs';
import { RadioBrowserApi } from '../../services/radio-browser/radio-browser-api.model';
import { SidebarService } from '../../services/sidebar.service';
import { StorageService } from '../../services/storage.service';

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
    MenuModule,
    DrawerModule,
  ],
  templateUrl: './audio-visualizer.component.html',
  styleUrl: './audio-visualizer.component.scss',
})
export class AudioVisualizerComponent {
  selectedStation = input.required<RadioBrowserApi.Station>();
  palette = input.required<Palette | null>();

  audioElement: HTMLMediaElement | null = null;
  containerElement: HTMLDivElement | null = null;
  audioMotion: AudioMotionAnalyzer | null = null;

  @ViewChild('thumbnail') thumbnailImage!: HTMLImageElement;

  sidebarService = inject(SidebarService);
  storageService = inject(StorageService);

  isFavorite(stationuuid: string) {
    return this.storageService.isFavorite(stationuuid);
  }

  constructor() {
    effect(() => {
      this.resetImageFallback();
      const palette = this.palette();

      if (!this.audioMotion) {
        this.initializeAudioMotion();
        this.watchAudioElementResize();
      }

      this.changeAudioMotionColor(palette);
    });

    effect(() => {
      this.onVolumeChange(this.volume());
    });
  }

  toggleFavorite() {
    this.storageService.toggleFavorite(this.selectedStation()!);
  }

  breakpointSub!: Subscription;
  breakpointObserver = inject(BreakpointObserver);

  ngAfterViewInit() {
    this.breakpointSub = this.breakpointObserver
      .observe([
        Breakpoints.Small,
        Breakpoints.Medium,
        Breakpoints.Large,
        Breakpoints.XLarge,
      ])
      .subscribe((result) => {
        if (result.matches && this.drawerVisible) {
          this.drawerVisible = false;
        }
      });

    const palette = this.palette();

    if (!this.audioMotion) {
      this.initializeAudioMotion();
      this.watchAudioElementResize();
    }

    this.changeAudioMotionColor(palette);
  }

  private changeAudioMotionColor(palette: Palette | null) {
    if (!this.audioMotion) return;

    let gradientLeft = 'orangered';
    let gradientRight = 'steelblue';

    const leftHex = this.storageService.isDark()
      ? palette?.LightVibrant?.hex || '#000000'
      : palette?.DarkVibrant?.hex || '#000000';

    this.audioMotion.registerGradient('customGradientLeft', {
      colorStops: [leftHex],
    });
    gradientLeft = 'customGradientLeft';

    const rightHex = this.storageService.isDark()
      ? palette?.Vibrant?.hex || '#808080'
      : palette?.Vibrant?.hex || '#808080';

    this.audioMotion.registerGradient('customGradientRight', {
      colorStops: [rightHex],
    });
    gradientRight = 'customGradientRight';

    this.audioMotion.setOptions({
      gradientLeft,
      gradientRight,
    });
  }

  @ViewChild('audioVisualizer') audioVisualizer!: ElementRef<HTMLDivElement>;
  private watchAudioElementResize() {
    if (!this.containerElement) return;
    const ro = new ResizeObserver(() => {
      const width = window.innerWidth;
      const height = this.containerElement!.clientHeight;

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

  volume = signal<number>(this.storageService.get('volume') ?? 100);

  get volumeState() {
    if (this.volume() == 0) {
      return 0;
    }
    if (this.volume() <= 50) {
      return 1;
    }

    return 2;
  }

  setVolume(value: number) {
    this.volume.set(value);
  }

  private onVolumeChange(value: number) {
    if (this.audioElement) this.audioElement.volume = Math.pow(value / 100, 2);
  }

  togglePlay() {
    if (!this.audioElement || !this.selectedStation()) {
      return;
    }
    if (this.audioElement.paused) {
      this.isPlaying.set(true);
      this.audioElement.play().catch((error) => {
        alert('Error playing audio');
      });
    } else {
      this.isPlaying.set(false);
      this.audioElement.pause();
    }
  }

  onRandom() {
    this.sidebarService.onRandomStation();
  }
  onBack() {
    this.sidebarService.onPreviousStation();
  }
  onForward() {
    this.sidebarService.onNextStation();
  }

  visitHomepage(station: RadioBrowserApi.Station) {
    window.open(station.homepage, '_blank');
  }

  getThumbnailUrl(station: RadioBrowserApi.Station): string {
    return station.favicon
      ? station.favicon
      : station.homepage + '/favicon.ico';
  }

  get backgroundColor() {
    const hex = this.storageService.isDark()
      ? this.palette()?.Vibrant?.hex || '#000000'
      : this.palette()?.LightVibrant?.hex || '#ffffff';

    return hex + '50';
  }

  get tagsBackgroundColor() {
    const hex = this.storageService.isDark()
      ? this.palette()?.LightMuted?.hex
      : this.palette()?.DarkMuted?.hex;

    return hex || '#808080';
  }

  get tagsTextColor() {
    const hex = this.storageService.isDark()
      ? this.palette()?.LightMuted?.bodyTextColor
      : this.palette()?.DarkMuted?.bodyTextColor;

    return hex || '#ffffff';
  }

  get buttonPrimaryColor() {
    return this.palette()?.Vibrant?.hex;
  }

  get buttonPrimaryColorSelected() {
    return this.palette()?.DarkVibrant?.hex;
  }

  get buttonPrimaryTextColorSelected() {
    return this.palette()?.DarkVibrant?.bodyTextColor;
  }

  get buttonTextColor() {
    return this.palette()?.Vibrant?.bodyTextColor;
  }

  get shuffleColor() {
    const hex = this.storageService.isDark()
      ? this.palette()?.LightVibrant?.hex
      : this.palette()?.DarkVibrant?.hex || '#808080';

    return hex;
  }

  get actionsColor() {
    const hex = this.storageService.isDark()
      ? this.palette()?.LightMuted?.hex || '#ffffff'
      : this.palette()?.DarkMuted?.hex || '#505050';

    return hex;
  }

  get sliderColor() {
    const hex = this.storageService.isDark()
      ? this.palette()?.LightVibrant?.hex || '#ffffff'
      : this.palette()?.Vibrant?.hex || '#000000';

    return hex;
  }

  get trackColor() {
    const hex = this.storageService.isDark()
      ? this.palette()?.LightVibrant?.hex || '#ffffff'
      : this.palette()?.Muted?.hex || '#000000';

    return hex ? hex + '20' : '#f0f0f0';
  }

  get playButtonBackgroundColor() {
    const hex = this.storageService.isDark()
      ? this.palette()?.LightMuted?.hex || '#ffffff'
      : this.palette()?.Vibrant?.hex || '#000000';

    return hex;
  }

  get playButtonTextColor() {
    const hex = this.storageService.isDark()
      ? this.palette()?.LightMuted?.titleTextColor || '#000000'
      : this.palette()?.Vibrant?.titleTextColor || '#ffffff';

    return hex;
  }

  get favoritesFillColor() {
    const hex = this.storageService.isDark()
      ? this.palette()?.Vibrant?.bodyTextColor || '#000000'
      : this.palette()?.Vibrant?.bodyTextColor || '#ffffff';

    return hex;
  }

  onShare(station: RadioBrowserApi.Station) {
    const shareData = {
      title: station.name,
      text: `Listen to ${station.name} on Radio Station App`,
      url: window.location.href,
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

  onAudioError(event: Event) {
    console.error(event);
  }

  @ViewChild('stationImg') stationImg!: ElementRef<HTMLImageElement>;
  @ViewChild('fallbackIcon') fallbackIcon!: ElementRef<HTMLElement>;

  resetImageFallback() {
    if (this.stationImg) {
      this.stationImg.nativeElement.style.display = 'inline';
    }
    if (this.fallbackIcon) {
      this.fallbackIcon.nativeElement.style.display = 'none';
    }
  }

  onImageError(event: Event) {
    if (this.stationImg) {
      this.stationImg.nativeElement.style.display = 'none';
    }
    if (this.fallbackIcon) {
      this.fallbackIcon.nativeElement.style.display = 'inline-block';
    }
  }

  previousVolume = signal(this.volume() == 0 ? 100 : this.volume());
  onVolumeToggle() {
    this.volume.update((value) => {
      if (value == 0) {
        return this.previousVolume();
      }

      return 0;
    });
  }

  onVolumeSlideEnd(value: number | undefined) {
    this.storageService.set('volume', value);
    if (!value || value == 0) return;

    this.previousVolume.set(value);
  }

  drawerVisible = false;

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

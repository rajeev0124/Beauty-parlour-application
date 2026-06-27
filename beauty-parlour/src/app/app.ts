import { Component, signal, OnInit, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { filter, map, mergeMap } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
})
export class App implements OnInit {
  protected readonly title = signal('beauty-parlour');

  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private metaService = inject(Meta);
  private titleService = inject(Title);

  ngOnInit() {
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.activatedRoute),
      map((route) => {
        while (route.firstChild) {
          route = route.firstChild;
        }
        return route;
      }),
      filter((route) => route.outlet === 'primary'),
      mergeMap((route) => route.data)
    ).subscribe((event) => {
      const defaultDesc = 'Beauty Parlour - Your premium destination for beauty and wellness.';
      const desc = event['description'] || defaultDesc;
      
      this.metaService.updateTag({ name: 'description', content: desc });
      this.metaService.updateTag({ name: 'keywords', content: 'beauty, parlour, salon, spa, wellness, makeup, cosmetics' });
      this.metaService.updateTag({ property: 'og:title', content: this.titleService.getTitle() });
      this.metaService.updateTag({ property: 'og:description', content: desc });
      this.metaService.updateTag({ property: 'og:type', content: 'website' });
    });
  }
}

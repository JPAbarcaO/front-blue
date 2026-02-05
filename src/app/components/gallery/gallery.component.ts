import { Component, OnInit } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TabsModule } from 'primeng/tabs';
import { User } from '@models/auth.models';
import { EvaluatedItem, Image } from '@models/image.models';
import { AuthService } from '@services/auth.service';
import { ImageService } from '@services/image.service';

interface ActionHistory {
  id: string;
  name: string;
  action: 'like' | 'dislike';
  timestamp: Date;
}

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [
    SlicePipe,
    RouterLink,
    ButtonModule,
    CardModule,
    MessageModule,
    ToastModule,
    TabsModule
  ],
  providers: [MessageService],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss'
})
export class GalleryComponent implements OnInit {
  currentImage: Image | null = null;
  currentUser: User | null = null;
  isLoading = false;
  hasLiked = false;
  hasDisliked = false;
  actionHistory: ActionHistory[] = [];
  topLikeItem: EvaluatedItem | null = null;
  topDislikeItem: EvaluatedItem | null = null;
  lastEvaluatedItem: EvaluatedItem | null = null;
  topLikeLoading = false;
  topDislikeLoading = false;
  lastEvaluatedLoading = false;
  topLikeError = '';
  topDislikeError = '';
  lastEvaluatedError = '';
  activeTab = 'top-like';
  canViewProtected = false;

  constructor(
    private imageService: ImageService,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.canViewProtected = !!this.currentUser && !!this.authService.getToken();
    this.loadImage();
    if (this.canViewProtected) {
      this.fetchTabData(this.activeTab);
    }
  }

  loadImage(): void {
    this.isLoading = true;
    this.hasLiked = false;
    this.hasDisliked = false;

    // Timeout de seguridad: resetear loading si toma más de 15 segundos
    const timeoutId = setTimeout(() => {
      console.warn('Image loading timeout');
      this.isLoading = false;
      this.messageService.add({
        severity: 'warn',
        summary: 'Timeout',
        detail: 'Taking too long to load image'
      });
    }, 15000);

    this.imageService.getRandomImage().subscribe({
      next: (image) => {
        clearTimeout(timeoutId);
        this.currentImage = image;
        this.checkUserReactions(image.sourceId);
        this.isLoading = false;
      },
      error: (err) => {
        clearTimeout(timeoutId);
        console.error('Error loading image:', err);
        this.isLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error loading image. Make sure backend is running at http://localhost:3000'
        });
      }
    });
  }

  private checkUserReactions(imageId: string): void {
    const userId = this.currentUser?.email || '';

    this.imageService.getUserLikes(userId).subscribe(likes => {
      this.hasLiked = likes.includes(imageId);
    });

    this.imageService.getUserDislikes(userId).subscribe(dislikes => {
      this.hasDisliked = dislikes.includes(imageId);
    });
  }

  likeImage(): void {
    if (!this.currentImage) return;

    this.isLoading = true;
    this.imageService.voteImage(this.currentImage, 'like').subscribe({
      next: () => {
        this.addToHistory(this.currentImage!.sourceId, this.currentImage!.name, 'like');
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Like sent'
        });
        // Cargar nueva imagen con pequeño delay
        setTimeout(() => this.loadImage(), 300);
      },
      error: (err) => {
        console.error('Vote error:', err);
        this.isLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.message || 'Error sending vote'
        });
      },
      complete: () => {}
    });
  }

  dislikeImage(): void {
    if (!this.currentImage) return;

    this.isLoading = true;
    this.imageService.voteImage(this.currentImage, 'dislike').subscribe({
      next: () => {
        this.addToHistory(this.currentImage!.sourceId, this.currentImage!.name, 'dislike');
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Dislike sent'
        });
        // Cargar nueva imagen con pequeño delay
        setTimeout(() => this.loadImage(), 300);
      },
      error: (err) => {
        console.error('Vote error:', err);
        this.isLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.message || 'Error sending vote'
        });
      },
      complete: () => {}
    });
  }

  private addToHistory(id: string, name: string, action: 'like' | 'dislike'): void {
    this.actionHistory.unshift({
      id,
      name,
      action,
      timestamp: new Date()
    });

    // Mantener solo los últimos 5 eventos
    if (this.actionHistory.length > 5) {
      this.actionHistory.pop();
    }
  }

  nextImage(): void {
    this.hasLiked = false;
    this.hasDisliked = false;
    this.loadImage();
  }

  logout(): void {
    this.authService.logout();
    this.resetProtectedItems();
    this.canViewProtected = false;
    this.router.navigate(['/login']);
  }

  onTabChange(value: string | number | undefined): void {
    const nextValue = typeof value === 'string' ? value : `${value ?? ''}`;
    this.activeTab = nextValue || 'top-like';
    if (this.canViewProtected) {
      this.fetchTabData(this.activeTab);
    }
  }

  private fetchTabData(tab: string): void {
    const token = this.authService.getToken();
    if (!token) {
      this.canViewProtected = false;
      return;
    }

    if (tab === 'top-like') {
      this.topLikeLoading = true;
      this.topLikeError = '';
      this.topLikeItem = null;
      this.imageService.getTopLike(token).subscribe({
        next: (item) => {
          this.topLikeItem = item;
        },
        error: () => {
          this.topLikeError = 'No se pudo cargar el Top Like';
        },
        complete: () => {
          this.topLikeLoading = false;
        }
      });
      return;
    }

    if (tab === 'top-dislike') {
      this.topDislikeLoading = true;
      this.topDislikeError = '';
      this.topDislikeItem = null;
      this.imageService.getTopDislike(token).subscribe({
        next: (item) => {
          this.topDislikeItem = item;
        },
        error: () => {
          this.topDislikeError = 'No se pudo cargar el Top Dislike';
        },
        complete: () => {
          this.topDislikeLoading = false;
        }
      });
      return;
    }

    if (tab === 'last-evaluated') {
      this.lastEvaluatedLoading = true;
      this.lastEvaluatedError = '';
      this.lastEvaluatedItem = null;
      this.imageService.getLastEvaluated(token).subscribe({
        next: (item) => {
          this.lastEvaluatedItem = item;
        },
        error: () => {
          this.lastEvaluatedError = 'No se pudo cargar el Último Evaluado';
        },
        complete: () => {
          this.lastEvaluatedLoading = false;
        }
      });
    }
  }

  private resetProtectedItems(): void {
    this.topLikeItem = null;
    this.topDislikeItem = null;
    this.lastEvaluatedItem = null;
    this.topLikeLoading = false;
    this.topDislikeLoading = false;
    this.lastEvaluatedLoading = false;
    this.topLikeError = '';
    this.topDislikeError = '';
    this.lastEvaluatedError = '';
  }
}

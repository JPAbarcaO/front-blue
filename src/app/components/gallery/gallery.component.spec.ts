import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { AuthService } from '@services/auth.service';
import { ImageService } from '@services/image.service';
import { GalleryComponent } from './gallery.component';
import { Image, EvaluatedItem } from '@models/image.models';
import { User } from '@models/auth.models';

describe('GalleryComponent', () => {
  let fixture: ComponentFixture<GalleryComponent>;
  let component: GalleryComponent;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let imageServiceSpy: jasmine.SpyObj<ImageService>;
  let router: Router;

  const mockUser: User = { email: 'demo@local.com', name: 'Demo' };
  const mockImage: Image = {
    source: 'pokemon',
    sourceId: '25',
    name: 'Pikachu',
    image: 'https://example.com/pikachu.png'
  };
  const mockItem: EvaluatedItem = {
    source: 'pokemon',
    sourceId: '25',
    name: 'Pikachu',
    image: 'https://example.com/pikachu.png',
    likes: 10,
    dislikes: 2,
    lastEvaluatedAt: null
  };

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', [
      'getCurrentUser',
      'getToken',
      'logout'
    ]);
    imageServiceSpy = jasmine.createSpyObj<ImageService>('ImageService', [
      'getRandomImage',
      'voteImage',
      'getUserLikes',
      'getUserDislikes',
      'getTopLike',
      'getTopDislike',
      'getLastEvaluated'
    ]);

    authServiceSpy.getCurrentUser.and.returnValue(mockUser);
    authServiceSpy.getToken.and.returnValue('token-123');
    imageServiceSpy.getRandomImage.and.returnValue(of(mockImage));
    imageServiceSpy.getUserLikes.and.returnValue(of([]));
    imageServiceSpy.getUserDislikes.and.returnValue(of([]));
    imageServiceSpy.getTopLike.and.returnValue(of(null));
    imageServiceSpy.getTopDislike.and.returnValue(of(null));
    imageServiceSpy.getLastEvaluated.and.returnValue(of(null));
    imageServiceSpy.voteImage.and.returnValue(of({ success: true, message: 'ok' }));

    await TestBed.configureTestingModule({
      imports: [GalleryComponent, RouterTestingModule, NoopAnimationsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ImageService, useValue: imageServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GalleryComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
  });

  it('loads image on init and fetches top-like item', () => {
    fixture.detectChanges();
    expect(imageServiceSpy.getRandomImage).toHaveBeenCalled();
    expect(imageServiceSpy.getTopLike).toHaveBeenCalledWith('token-123');
    expect(component.currentImage).toEqual(mockImage);
  });

  it('likeImage sends vote and adds to history', fakeAsync(() => {
    fixture.detectChanges();
    component.currentImage = mockImage;
    spyOn(component, 'loadImage');

    component.likeImage();

    expect(imageServiceSpy.voteImage).toHaveBeenCalledWith(mockImage, 'like');
    expect(component.actionHistory.length).toBe(1);
    expect(component.actionHistory[0].action).toBe('like');

    tick(300);
    expect(component.loadImage).toHaveBeenCalled();
  }));

  it('dislikeImage sends vote and adds to history', fakeAsync(() => {
    fixture.detectChanges();
    component.currentImage = mockImage;
    spyOn(component, 'loadImage');

    component.dislikeImage();

    expect(imageServiceSpy.voteImage).toHaveBeenCalledWith(mockImage, 'dislike');
    expect(component.actionHistory.length).toBe(1);
    expect(component.actionHistory[0].action).toBe('dislike');

    tick(300);
    expect(component.loadImage).toHaveBeenCalled();
  }));

  it('onTabChange fetches selected tab data', () => {
    fixture.detectChanges();
    imageServiceSpy.getTopDislike.calls.reset();

    component.onTabChange('top-dislike');

    expect(imageServiceSpy.getTopDislike).toHaveBeenCalledWith('token-123');
  });

  it('onTabChange does nothing when user is not logged in', () => {
    authServiceSpy.getCurrentUser.and.returnValue(null);
    authServiceSpy.getToken.and.returnValue(null);
    fixture.detectChanges();
    imageServiceSpy.getTopLike.calls.reset();

    component.currentUser = null;
    component.canViewProtected = false;
    component.onTabChange('top-like');

    expect(imageServiceSpy.getTopLike).not.toHaveBeenCalled();
  });

  it('logout clears protected items and navigates', () => {
    fixture.detectChanges();
    component.topLikeItem = mockItem;
    component.topDislikeItem = mockItem;
    component.lastEvaluatedItem = mockItem;

    component.logout();

    expect(authServiceSpy.logout).toHaveBeenCalled();
    expect(component.topLikeItem).toBeNull();
    expect(component.topDislikeItem).toBeNull();
    expect(component.lastEvaluatedItem).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});

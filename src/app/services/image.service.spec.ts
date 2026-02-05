import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ImageService } from './image.service';
import { Image } from '@models/image.models';

describe('ImageService', () => {
  let service: ImageService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(ImageService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('getRandomImage should call backend', (done) => {
    const mockImage: Image = {
      source: 'pokemon',
      sourceId: '25',
      name: 'Pikachu',
      image: 'https://example.com/pikachu.png'
    };

    service.getRandomImage().subscribe((image) => {
      expect(image).toEqual(mockImage);
      done();
    });

    const req = httpMock.expectOne('http://localhost:3000/api/v1/characters/random');
    expect(req.request.method).toBe('GET');
    req.flush(mockImage);
  });

  it('voteImage should post vote data', (done) => {
    const mockImage: Image = {
      source: 'pokemon',
      sourceId: '25',
      name: 'Pikachu',
      image: 'https://example.com/pikachu.png'
    };

    service.voteImage(mockImage, 'like').subscribe((response) => {
      expect(response.success).toBeTrue();
      done();
    });

    const req = httpMock.expectOne('http://localhost:3000/api/v1/characters/vote');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      source: 'pokemon',
      sourceId: '25',
      name: 'Pikachu',
      image: 'https://example.com/pikachu.png',
      vote: 'like'
    });
    req.flush({ success: true, message: 'ok' });
  });

  it('getTopLike should send Authorization header', (done) => {
    service.getTopLike('token-123').subscribe((item) => {
      expect(item).toBeNull();
      done();
    });

    const req = httpMock.expectOne('http://localhost:3000/api/v1/characters/top-like');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token-123');
    req.flush({ item: null });
  });

  it('getTopDislike should send Authorization header', (done) => {
    service.getTopDislike('token-abc').subscribe((item) => {
      expect(item).toBeNull();
      done();
    });

    const req = httpMock.expectOne('http://localhost:3000/api/v1/characters/top-dislike');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token-abc');
    req.flush({ item: null });
  });

  it('getLastEvaluated should send Authorization header', (done) => {
    service.getLastEvaluated('token-xyz').subscribe((item) => {
      expect(item).toBeNull();
      done();
    });

    const req = httpMock.expectOne('http://localhost:3000/api/v1/characters/last-evaluated');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token-xyz');
    req.flush({ item: null });
  });

  it('getUserLikes should filter by userId', (done) => {
    localStorage.setItem(
      'likes',
      JSON.stringify([
        { userId: 'u1', imageId: '1' },
        { userId: 'u2', imageId: '2' }
      ])
    );

    service.getUserLikes('u1').subscribe((likes) => {
      expect(likes).toEqual(['1']);
      done();
    });
  });

  it('getUserDislikes should filter by userId', (done) => {
    localStorage.setItem(
      'dislikes',
      JSON.stringify([
        { userId: 'u1', imageId: '3' },
        { userId: 'u2', imageId: '4' }
      ])
    );

    service.getUserDislikes('u2').subscribe((dislikes) => {
      expect(dislikes).toEqual(['4']);
      done();
    });
  });
});

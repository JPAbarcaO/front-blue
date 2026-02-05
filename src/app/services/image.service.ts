import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';
import {
  EvaluatedItem,
  Image,
  ProtectedItemResponse,
  VoteRequest,
  VoteResponse
} from '@models/image.models';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private apiRandomUrl = 'http://localhost:3000/api/v1/characters/random';
  private apiVoteUrl = 'http://localhost:3000/api/v1/characters/vote';
  private apiTopLikeUrl = 'http://localhost:3000/api/v1/characters/top-like';
  private apiTopDislikeUrl = 'http://localhost:3000/api/v1/characters/top-dislike';
  private apiLastEvaluatedUrl = 'http://localhost:3000/api/v1/characters/last-evaluated';

  constructor(private http: HttpClient) {}

  getRandomImage(): Observable<Image> {
    return this.http.get<Image>(this.apiRandomUrl).pipe(
      catchError(error => {
        console.error('Error fetching image:', error);
        throw error;
      })
    );
  }

  voteImage(image: Image, vote: 'like' | 'dislike'): Observable<VoteResponse> {
    const voteData: VoteRequest = {
      source: image.source,
      sourceId: image.sourceId,
      name: image.name,
      image: image.image,
      vote
    };

    return this.http.post<VoteResponse>(this.apiVoteUrl, voteData).pipe(
      catchError(error => {
        console.error('Error voting:', error);
        throw error;
      })
    );
  }

  private buildAuthHeaders(token: string): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getTopLike(token: string): Observable<EvaluatedItem | null> {
    return this.http
      .get<ProtectedItemResponse>(this.apiTopLikeUrl, {
        headers: this.buildAuthHeaders(token)
      })
      .pipe(
        map(response => response.item),
        catchError(error => {
          console.error('Error fetching top-like item:', error);
          throw error;
        })
      );
  }

  getTopDislike(token: string): Observable<EvaluatedItem | null> {
    return this.http
      .get<ProtectedItemResponse>(this.apiTopDislikeUrl, {
        headers: this.buildAuthHeaders(token)
      })
      .pipe(
        map(response => response.item),
        catchError(error => {
          console.error('Error fetching top-dislike item:', error);
          throw error;
        })
      );
  }

  getLastEvaluated(token: string): Observable<EvaluatedItem | null> {
    return this.http
      .get<ProtectedItemResponse>(this.apiLastEvaluatedUrl, {
        headers: this.buildAuthHeaders(token)
      })
      .pipe(
        map(response => response.item),
        catchError(error => {
          console.error('Error fetching last-evaluated item:', error);
          throw error;
        })
      );
  }

  getUserLikes(userId: string): Observable<string[]> {
    return new Observable(observer => {
      const likes = localStorage.getItem('likes');
      const likesArray = likes ? JSON.parse(likes) : [];
      const userLikes = likesArray
        .filter((l: any) => l.userId === userId)
        .map((l: any) => l.imageId);
      observer.next(userLikes);
      observer.complete();
    });
  }

  getUserDislikes(userId: string): Observable<string[]> {
    return new Observable(observer => {
      const dislikes = localStorage.getItem('dislikes');
      const dislikesArray = dislikes ? JSON.parse(dislikes) : [];
      const userDislikes = dislikesArray
        .filter((d: any) => d.userId === userId)
        .map((d: any) => d.imageId);
      observer.next(userDislikes);
      observer.complete();
    });
  }
}

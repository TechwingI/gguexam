import { Injectable, inject } from '@angular/core';
import {
  Database,
  ref,
  set,
  push,
  get,
  query,
  orderByChild,
  equalTo
} from '@angular/fire/database';
import { User, Question, CodingQuestion, ExamResult, ExamData } from '../models/exam';

@Injectable({ providedIn: 'root' })
export class FirebaseRealtimeService {
  private db: Database = inject(Database);

  // ------- USERS -------
  async saveUser(user: User): Promise<void> {
    if (!user.uid) throw new Error('User uid missing');
    await set(ref(this.db, `exam_data/users/${user.uid}`), {
      ...user,
      createdAt: user.createdAt.toISOString(),
      lastLogin: user.lastLogin?.toISOString() ?? null
    });
  }

  async emailExists(email: string): Promise<boolean> {
    const q = query(
      ref(this.db, 'exam_data/users'),
      orderByChild('email'),
      equalTo(email)
    );
    const snap = await get(q);
    return snap.exists();
  }

  // ------- QUESTIONS (all sections) -------
  async getFullQuestionSet(course: string): Promise<ExamData> {
    const snap = await get(ref(this.db, `exam_data/questions/${course}`));
    if (!snap.exists()) {
      return { aptitude: [], verbal: [], technical: [], coding: [] };
    }
    const data = snap.val();

    const mapMCQ = (obj: any = {}): Question[] =>
      Object.keys(obj).map((id) => obj[id] as Question);

    const mapCoding = (obj: any = {}): CodingQuestion[] =>
      Object.keys(obj).map((id) => ({ id, ...(obj[id] as CodingQuestion) }));

    return {
      aptitude: mapMCQ(data.aptitude),
      verbal: mapMCQ(data.verbal),
      technical: mapMCQ(data.technical),
      coding: mapCoding(data.coding)
    };
  }

  // ------- RESULTS -------
  async saveExamResult(result: ExamResult): Promise<string> {
    const historyRef = ref(this.db, `exam_data/results/${result.user_id}/history`);
    const newRef = push(historyRef);
    await set(newRef, {
      ...result,
      timestamp: result.timestamp.toISOString()
    });

    await set(
      ref(this.db, `exam_data/results/${result.user_id}/lastResult`),
      {
        ...result,
        timestamp: result.timestamp.toISOString()
      }
    );

    return newRef.key as string;
  }
}

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, sanitizeFirestoreData } from '../firebase';
import { Post, PostType } from '../types';
import { DEFAULT_VILLAGE } from '../config/village';

const POSTS_COLLECTION = 'posts';

export interface PostFilters {
  postType?: PostType | 'all';
  category?: string;
  maxRate?: number;
  date?: string;
  searchQuery?: string;
}

export const postService = {
  async createPost(post: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'acceptedWorkersCount'>): Promise<string> {
    const postRef = doc(collection(db, POSTS_COLLECTION));
    const now = new Date().toISOString();

    const rawPost: Record<string, any> = {
      ...post,
      id: postRef.id,
      village: post.village?.trim() || DEFAULT_VILLAGE,
      acceptedWorkersCount: 0,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };

    const newPost = sanitizeFirestoreData(rawPost);

    try {
      await setDoc(postRef, newPost);
      return postRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `${POSTS_COLLECTION}/${postRef.id}`);
      throw error;
    }
  },

  async getVillagePosts(village?: string, filters?: PostFilters): Promise<Post[]> {
    try {
      let q;
      if (village && village !== 'all') {
        q = query(
          collection(db, POSTS_COLLECTION),
          where('village', '==', village)
        );
      } else {
        q = collection(db, POSTS_COLLECTION);
      }

      const snapshot = await getDocs(q);
      let posts: Post[] = [];
      snapshot.forEach((docSnap) => {
        posts.push(docSnap.data() as Post);
      });

      // Sort client-side by date descending
      posts.sort((a, b) => {
        const tA = new Date(a.createdAt || 0).getTime();
        const tB = new Date(b.createdAt || 0).getTime();
        return tB - tA;
      });

      // Apply client-side filters
      if (filters) {
        if (filters.postType && filters.postType !== 'all') {
          posts = posts.filter((p) => p.postType === filters.postType);
        }
        if (filters.category && filters.category !== 'all') {
          posts = posts.filter((p) => p.category?.includes(filters.category!) || p.title?.includes(filters.category!));
        }
        if (filters.maxRate && filters.maxRate > 0) {
          posts = posts.filter((p) => p.rate <= filters.maxRate!);
        }
        if (filters.date) {
          posts = posts.filter((p) => p.workDate === filters.date);
        }
        if (filters.searchQuery?.trim()) {
          const qLower = filters.searchQuery.toLowerCase();
          posts = posts.filter(
            (p) =>
              p.title.toLowerCase().includes(qLower) ||
              p.authorName.toLowerCase().includes(qLower) ||
              (p.cropName && p.cropName.toLowerCase().includes(qLower)) ||
              (p.location && p.location.toLowerCase().includes(qLower)) ||
              (p.description && p.description.toLowerCase().includes(qLower))
          );
        }
      }

      return posts;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, POSTS_COLLECTION);
      return [];
    }
  },

  async getUserPosts(userId: string): Promise<Post[]> {
    try {
      const q = query(
        collection(db, POSTS_COLLECTION),
        where('authorId', '==', userId)
      );
      const snapshot = await getDocs(q);
      const posts: Post[] = [];
      snapshot.forEach((docSnap) => {
        posts.push(docSnap.data() as Post);
      });
      posts.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      return posts;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, POSTS_COLLECTION);
      return [];
    }
  },

  async getPostById(postId: string): Promise<Post | null> {
    try {
      const docRef = doc(db, POSTS_COLLECTION, postId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as Post;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `${POSTS_COLLECTION}/${postId}`);
      return null;
    }
  },

  async deletePost(postId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, POSTS_COLLECTION, postId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${POSTS_COLLECTION}/${postId}`);
      throw error;
    }
  },

  async updatePostStatus(postId: string, status: Post['status']): Promise<void> {
    try {
      await updateDoc(doc(db, POSTS_COLLECTION, postId), {
        status,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${POSTS_COLLECTION}/${postId}`);
      throw error;
    }
  },

  /**
   * Seeds demo village posts if Firestore is completely empty for this village.
   * This guarantees a rich, live experience for farmers in the village immediately.
   */
  async seedVillagePostsIfEmpty(authorId: string, authorName: string, authorPhone: string) {
    try {
      const existing = await this.getVillagePosts(DEFAULT_VILLAGE);
      if (existing.length > 0) return;

      const samplePosts: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>[] = [
        {
          authorId,
          authorName: 'रामभाऊ पाटील (शेतकरी)',
          authorPhone: '9822156789',
          village: DEFAULT_VILLAGE,
          postType: 'workers_needed',
          title: 'कापूस वेचणीसाठी ५ महिला मजूर पाहिजेत',
          category: 'कापूस वेचणी (Cotton Picking)',
          requiredWorkers: 5,
          acceptedWorkersCount: 0,
          cropName: 'कापूस (Cotton)',
          workDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          workTime: 'सकाळी ८:०० ते दुपारी २:००',
          duration: '३ दिवस',
          rate: 350,
          rateType: 'प्रतिदिन',
          location: 'दोंदुडा शिवार, गट नं. १२४, कालव्याजवळ',
          description: 'वेचणीचे काम तातडीचे आहे. पिण्याच्या पाण्याची व चहाची सोय शेतात उपलब्ध आहे.',
          status: 'active',
        },
        {
          authorId,
          authorName: 'तानाजी जाधव (मजूर गटप्रमुख)',
          authorPhone: '9850022334',
          village: DEFAULT_VILLAGE,
          postType: 'work_wanted',
          title: 'निंदण व खुरपणी कामासाठी ४ मजुरांचा गट उपलब्ध',
          category: 'निंदण / खुरपणी (Weeding)',
          requiredWorkers: 4,
          cropName: 'सोयाबीन व कांदा',
          workDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
          workTime: 'सकाळी ७:३० ते दुपारी १:३०',
          duration: 'कामाच्या गरजेनुसार',
          rate: 300,
          rateType: 'प्रतिदिन',
          location: 'दोंदुडा संपूर्ण परिसर',
          description: 'अनुभवी मजूर, काम वेळेवर व स्वच्छ करून दिले जाईल.',
          status: 'active',
        },
        {
          authorId,
          authorName: 'बाळासाहेब पाटील (ट्रॅक्टर मालक)',
          authorPhone: '9881033445',
          village: DEFAULT_VILLAGE,
          postType: 'tractor_service',
          title: 'महिंद्रा ४५ HP ट्रॅक्टर + रोटाव्हेटर नांगरणी सेवा',
          category: 'रोटाव्हेटर (Rotavator)',
          workDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          rate: 900,
          rateType: 'प्रतितास',
          location: 'दोंदुडा व लगतची शेते',
          description: 'रोटाव्हेटर, नांगर व ट्रॉली उपलब्ध. माती अतिशय भुसभुशीत करून नांगरणी करून मिळेल.',
          equipmentDetails: 'महिंद्रा ४७५ DI + शक्तीमान रोटाव्हेटर',
          status: 'active',
        },
        {
          authorId,
          authorName: 'तुकाराम शिंदे (शेतकरी)',
          authorPhone: '9890044556',
          village: DEFAULT_VILLAGE,
          postType: 'bullock_service',
          title: 'पेरणी व वखरणीसाठी मजबूत खिलार बैलजोडी उपलब्ध',
          category: 'पेरणी / पाभर (Sowing with Tifhan)',
          workDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
          rate: 1200,
          rateType: 'प्रतिदिन',
          location: 'दोंदुडा गावठाण व शिवार',
          description: 'पाभर, तिफण व वखर अवजारांसह उपलब्ध. पारंपारिक पद्धतीने अचूक पेरणी करून दिली जाईल.',
          equipmentDetails: 'खिलार बैलजोडी + तिफण + लाकडी नांगर',
          status: 'active',
        },
        {
          authorId,
          authorName: 'विनायक देशमुख (कृषी सेवा केंद्र)',
          authorPhone: '9860055667',
          village: DEFAULT_VILLAGE,
          postType: 'seeds',
          title: 'महाबीज प्रमाणित सोयाबीन (JS 335) दर्जेदार बियाणे उपलब्ध',
          category: 'सोयाबीन बियाणे (उदा. JS-335, फुले संगम)',
          workDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          rate: 3200,
          rateType: 'प्रति बॅग',
          location: 'दोंदुडा बस स्टँड चौक, देशमुख कृषी केंद्र',
          description: '१००% उगवण क्षमता तपासलेले शासकीय प्रमाणित बियाणे. बिल व हमीसह उपलब्ध.',
          equipmentDetails: '३० किलोची मूळ सीलबंद बॅग, ५० बॅगा शिल्लक',
          status: 'active',
        },
        {
          authorId,
          authorName: 'संजय चव्हाण (सेंद्रिय शेतकरी)',
          authorPhone: '9834512345',
          village: DEFAULT_VILLAGE,
          postType: 'fertilizers',
          title: 'शुद्ध गांडूळ खत व निंबोळी पेंड - थेट शेतात पोहोच',
          category: 'सेंद्रिय गांडूळ खत (Vermicompost)',
          workDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
          rate: 350,
          rateType: 'प्रति बॅग',
          location: 'दोंदुडा, शेत गट नं. ४५',
          description: 'शेतीची सुपिकता वाढवणारे उत्तम प्रतीचे गांडूळ खत. ५० किलोच्या गोण्यांमध्ये उपलब्ध. १० पेक्षा जास्त गोण्यांवर मोफत डिलिव्हरी.',
          equipmentDetails: '५० किलो पोती, सेंद्रिय प्रमाणपत्रासह',
          status: 'active',
        },
        {
          authorId,
          authorName: 'विनायक देशमुख (कृषी सेवा केंद्र)',
          authorPhone: '9860055667',
          village: DEFAULT_VILLAGE,
          postType: 'agri_tools',
          title: '१६ लिटर ड्युअल मोटर बॅटरी स्प्रे पंप व ठिबक साहित्य',
          category: 'बॅटरी / चार्जिंग स्प्रे पंप (Battery Sprayer)',
          workDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          rate: 1800,
          rateType: 'प्रति नग',
          location: 'दोंदुडा मुख्य रस्ता',
          description: '१२ व्होल्ट १२ एम्पिअर बॅटरी, एकदा चार्ज केल्यावर २५ ते ३० पंप फवारणी, ६ महिने वॉरंटी.',
          equipmentDetails: 'नेपसॅक स्प्रे पंप + ४ प्रकारचे नोझल + चार्जर',
          status: 'active',
        },
        {
          authorId,
          authorName: 'अजित पाटील (एग्रीटेक ड्रोन्स)',
          authorPhone: '9881122334',
          village: DEFAULT_VILLAGE,
          postType: 'agri_services',
          title: 'अचूक ड्रोन फवारणी सेवा - १० मिनिटांत १ एकर फवारणी',
          category: 'ड्रोन फवारणी सेवा (Drone Spraying)',
          workDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          rate: 450,
          rateType: 'प्रतिएकर',
          location: 'दोंदुडा व १० किमी परिसर',
          description: 'कीटकनाशक व टॉनिकची अतिशय सूक्ष्म व एकसमान फवारणी. पाण्याचा व औषधाचा ४०% अपव्यय वाचतो.',
          equipmentDetails: '१० लिटर ॲग्री ड्रोन, कुशल पायलट व जनरेटरसह',
          status: 'active',
        },
      ];

      for (const p of samplePosts) {
        await this.createPost(p);
      }
    } catch (e) {
      console.warn('Seed notice:', e);
    }
  },
};

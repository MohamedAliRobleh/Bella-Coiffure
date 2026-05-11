import { PHOTOS } from "./photos";

export const STAFF = {
  femme: [
    {
      id: "f1",
      nom: "Amina Hassan",
      photo: PHOTOS.STAFF_F1,
      specialite: "Tressage & coiffures naturelles",
      genre: "femme",
    },
    {
      id: "f2",
      nom: "Hawa Ali",
      photo: PHOTOS.STAFF_F2,
      specialite: "Coloration & défrisage",
      genre: "femme",
    },
    {
      id: "f3",
      nom: "Fatima Omar",
      photo: PHOTOS.STAFF_F3,
      specialite: "Soins capillaires & coupe",
      genre: "femme",
    },
  ],
  homme: [
    {
      id: "m1",
      nom: "Karim Dini",
      photo: PHOTOS.STAFF_M1,
      specialite: "Coupe & brushing",
      genre: "homme",
    },
    {
      id: "m2",
      nom: "Youssouf Ahmed",
      photo: PHOTOS.STAFF_M2,
      specialite: "Tressage & locks",
      genre: "homme",
    },
  ],
};

export const ALL_STAFF = [...STAFF.femme, ...STAFF.homme];

// Shared mock data for competitions used by Home + Competitions screens
export type Competition = {
  id: string;
  title: string;
  organizer: string;
  category: string;
  grade: string[];
  deadline: string;
  deadlineDate: Date;
  price: number;
  image: string;
  color: string;
  description?: string;
  steps?: string[];
  startDate?: string;
  endDate?: string;
  ages?: string;
  prize?: string;
};

export const COMPETITIONS: Competition[] =
  [
    {
      id: "1",
      title:
        "English Math Championship",
      organizer: "Kemendikbud",
      category: "Math",
      grade: ["SD", "SMP"],
      deadline: "30 Mar 2026",
      deadlineDate: new Date(
        2026,
        2,
        30,
      ),
      price: 0,
      image: "📐",
      color: "#EEF2FF",
      description:
        "A national math challenge for young learners focusing on fundamentals and problem solving.",
      steps: [
        "Online registration",
        "Preliminary online test",
        "Regional final (online/offline)",
      ],
      startDate: "1 Apr 2026",
      endDate: "30 Apr 2026",
      ages: "8-15",
      prize:
        "Medals, certificates, scholarships",
    },
    {
      id: "2",
      title: "ISPO Science Olympiad",
      organizer: "ISPO Committee",
      category: "Science",
      grade: ["SMP", "SMA"],
      deadline: "15 Apr 2026",
      deadlineDate: new Date(
        2026,
        3,
        15,
      ),
      price: 75000,
      image: "🔬",
      color: "#ECFDF5",
      description:
        "A practical and theoretical science competition covering physics, chemistry and biology topics.",
      steps: [
        "Register online",
        "Submit abstract (for project track)",
        "Final presentation & exam",
      ],
      startDate: "20 Apr 2026",
      endDate: "25 Apr 2026",
      ages: "13-18",
      prize:
        "Trophies, internship opportunities",
    },
    {
      id: "3",
      title: "OSEBI Economics",
      organizer:
        "UI Faculty of Economics",
      category: "Economics",
      grade: ["SMA"],
      deadline: "20 Apr 2026",
      deadlineDate: new Date(
        2026,
        3,
        20,
      ),
      price: 100000,
      image: "📊",
      color: "#FFF7ED",
      description:
        "Case-study based economics competition testing analytical and presentation skills.",
      steps: [
        "Team registration",
        "Online case submission",
        "Grand final presentation",
      ],
      startDate: "10 May 2026",
      endDate: "15 May 2026",
      ages: "16-18",
      prize:
        "Scholarships and cash prizes",
    },
    {
      id: "4",
      title: "National Essay Writing",
      organizer: "Badan Bahasa",
      category: "Language",
      grade: ["SMP", "SMA"],
      deadline: "10 Apr 2026",
      deadlineDate: new Date(
        2026,
        3,
        10,
      ),
      price: 0,
      image: "✍️",
      color: "#FFF1F2",
      description:
        "Essay competition promoting critical thinking and academic writing in Bahasa Indonesia.",
      steps: [
        "Open submission",
        "Shortlist",
        "Final judging",
      ],
      startDate: "15 Apr 2026",
      endDate: "30 Apr 2026",
      ages: "13-18",
      prize:
        "Certificates and publication opportunity",
    },
    {
      id: "5",
      title: "Robotics Innovation Cup",
      organizer: "ITB Robotics Club",
      category: "Technology",
      grade: ["SMP", "SMA"],
      deadline: "5 May 2026",
      deadlineDate: new Date(
        2026,
        4,
        5,
      ),
      price: 150000,
      image: "🤖",
      color: "#F0F9FF",
      description:
        "Build and program robots to solve real-world challenges in timed missions.",
      steps: [
        "Prototype submission",
        "Qualifier rounds",
        "Final challenge",
      ],
      startDate: "10 May 2026",
      endDate: "12 May 2026",
      ages: "13-18",
      prize:
        "Trophies, sponsored hardware kits",
    },
    {
      id: "6",
      title: "Art & Design Festival",
      organizer: "Smesco Indonesia",
      category: "Art",
      grade: ["SD", "SMP", "SMA"],
      deadline: "25 Apr 2026",
      deadlineDate: new Date(
        2026,
        3,
        25,
      ),
      price: 50000,
      image: "🎨",
      color: "#FDF4FF",
      description:
        "A creative festival showcasing student artworks across multiple categories.",
      steps: [
        "Individual submission",
        "Curation",
        "Exhibition",
      ],
      startDate: "30 Apr 2026",
      endDate: "5 May 2026",
      ages: "7-18",
      prize:
        "Exhibition slots and certificates",
    },
  ];

export const BANNERS = [
  {
    id: "b1",
    title: "EMC 2026",
    subtitle:
      "English Math Championship\nRegistration open now!",
    color: "#4F46E5",
    accent: "#818CF8",
    emoji: "📐",
  },
  {
    id: "b2",
    title: "ISPO Olympiad",
    subtitle:
      "Science competition for\nSMP & SMA students",
    color: "#0891B2",
    accent: "#22D3EE",
    emoji: "🔬",
  },
  {
    id: "b3",
    title: "Robotics Cup",
    subtitle:
      "Build. Code. Win.\nRegister before May 5",
    color: "#7C3AED",
    accent: "#A78BFA",
    emoji: "🤖",
  },
];

export const CATEGORIES = [
  { label: "Math", emoji: "📐" },
  { label: "Science", emoji: "🔬" },
  { label: "Language", emoji: "✍️" },
  { label: "Economics", emoji: "📊" },
  { label: "Technology", emoji: "🤖" },
  { label: "Art", emoji: "🎨" },
];

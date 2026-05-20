import { LeaderboardEntry, TourPlan } from "./types";

export const IMAGES = {
  raMascot: "https://lh3.googleusercontent.com/aida-public/AB6AXuAQVHtMkdnO2X2MUPyehwE0bMl01_ZUwXmdI_Y_jJgS4YCETuLKl4hiQ1Zd1c1V471IWRalfy8MjbLcnvZrp-ysZ7wZpUWmeWkZImMWeP5ZKTVuLSIJlzLVU_WdXfQ1NIQKBw04jvrR00ZKqqU9lgWCncNPRcSog6AAbpaHhCQxeASmBgilmiQkWRrxy_J673XOW7NKhGjVGmFqGnRuUcwHHBDG6PtLaiqle8CfpBbp9cWpZE0mkVhpgwiBvfG_1c0y741PdpnTxhI",
  hieroglyphsWorkshop: "https://lh3.googleusercontent.com/aida-public/AB6AXuAPgNfio6WCpt0Qpk2EGmRpWeK92rHu01Vo1ViIpHXp9pF4Qsg8MYTs68CPA4hKRfZSKfVXO5FrJ8GQxe-jAy5KAzWF1UZJt9Xy3J8-lAUKBGtq1GjwjISRyOU1_K4r7VR4f8UJpNgQPD00IQlv7pjBRKc-m-qsD49biZsMc1TL6Ms8UX6rGjcolPeJmIvi4RZxCSTkbpxdTH0ltRFCfli_DCVJlao0MG7swuJBv7rynZ4buA9VYMVn3ulLYSh3CQ0QGaMzGmuCxUc",
  sunsetSail: "https://lh3.googleusercontent.com/aida-public/AB6AXuC5yLpv_Q4aHE0eFSj9Leg2uJdTaZllPT1BQbQ5Fv_v8F_AyP8FULmAFEWrP9I3I11o_BgpUXai2lvrgX05CimO_hX378xoOXf9S3Vi784vrP98n-6sMkw6v3ZrIyeDw6as5A7LGXnOF3LQyTjZs0TDSvhumzP-6wTzpIHpbY7kvfxt7Ee8gfWhjuT8UsoKwMCjpWb_M4-7yRog55FQChItfzw3O0pLUpBMtKYSmaNVHnby5t6veFJxDBHe9yVvf2SiPS5x6Ie7B6g",
  luxorNight: "https://lh3.googleusercontent.com/aida-public/AB6AXuAmYM5KyPLYqGS9NtAFLJK96OrfbuOdD5PfThn03lwfPM33dqxDZ3QwHRA88Pmu9enBli7atIUjGMgnypqEKPA4nnu4M9dYMPhcKPquabbQwWnZ-sbZ2ycrmUk-KPPDm_4OXGdPDGd83hWkl-ZKB_kOEjDa2B5PokdaV--tAENmo0zhvs1u2MPYkDa-o6aa63elyKhV42UEfdyozy5w8naNnhaxyQNyZ_Txv4HPZOLndE0wf3RrdpkgApzuOjK574e0DFLnDzMEdkU",
  scanningPylon: "https://lh3.googleusercontent.com/aida-public/AB6AXuCYjVdpKs1_hbf_yJJANl6YFz6pmw4DNl8z4u_7eht5vEZ3EBaWL-MH7MyLvWjbiIbPEMRYtEYeQxz_4kFHSsugiwCG998w5lGS9ZwWPtKjw-0BT9e8OAMp5lyya_gtPmOfCP5N0S0fOyPsDTqO1nkkvb2FdVx39oM4WW2ilyVsRBEETrEyvo-2qLePhDvXIjatdLN4h1zPZLxYMGO7ofsI9WN5xE_AXAdsHlv87URHTQrN_coR4dqtDXZYQtZq0JLvMz2CoXZoeYU",
  luxorGoldenHour: "https://lh3.googleusercontent.com/aida-public/AB6AXuCnZTT8btafKOthlDpYKz8m9KviIYhUP2x-TbbmyvjSKtRdi9YxsdKszrKbOD75V4MqhjPgyeBT9S7jDK8xTv6yuMYuoGyLWqI7g870T0yMg8E0LCDJjaijJ8Q7-HZJdcKWE8eRhd2nnJN9kLcO96N9SBvwzv_N6EkSFtukw8EQEBqqn1Jt1ENgssgnEIqZocVyRo4OsGQQ1Ia3oQFi77geSasK_l4ERO8Bx4VZ0RQ6uwjAK20R3M_Xzbqx5_nMCjy0reau7NpNXBM",
  relicHieroglyphs: "https://lh3.googleusercontent.com/aida-public/AB6AXuDAZmzSMiemtbZJpCNHCPBuXkAWpxCiwx0ujj3nvFWzShP1n7O33VrQXfvkccWN0JqPFnSPI1X7f2Apb1mcAB9Ck6Di3yZI0-St93WDVAmeKXMr1CbHn7BrH6-U9Ttm0wzknu4YozIyn-bVrxSJeAVvjkm-j2CoUmHs8P2Xuqdm1aWnVfppws1PUifU4rjch7LSq-GfYcbGfCiuKIrdry6hKTspOSlq_BXeADg_BPDlA3O7a6WnmD9r-xCZCyYIRj2z1eaYos8_8iM",
  relicNocturnal: "https://lh3.googleusercontent.com/aida-public/AB6AXuCB13wwetaStgSR_btzGnn1XObp-VcXgTYnqVuE-2qeymugioe99dDEMf2guYGRjmSSVmClPehc4Dq2sWiC9uYCGv5XREgq1L4CkOrFD2Bdm9bcgQznUI0hQG3Dh-aUa64rqyacrcJQLD234WuXwGK6ZP-4cIpH4Fzs65y-Z2_hNV2qQ5xJHY2bvelyG-lmI6xwWiAxa_kDOMzt7roHqn519OVDBjOrnKWvPS58Dw8T3vi-dFHI-NX_hful77rZFZ4BTmjIdU7gxKo",
  relicSeatedColossus: "https://lh3.googleusercontent.com/aida-public/AB6AXuBfF9fhNgf-JY1GhMSKuDOR38AloHhJrtrkmXqe1o7LQftWLHICK1OLPiamvDgD_eozEz8fmLZJ5bpXfiUgmSjRpxDZVNCf8QuPEZ8B3Nr8fFiKOnU8V_VXYKRMwkhJCVJksCDAhhMXXULSqflystXHKJQBtZcQyaes6SnNtyt8sRWtlK14DheBrAIrbyQlAK9Hdv66W_JZU8UhtdHIVCBp3opF1V6cnkrbgFMQiJjsqEbN6ABhQ0yrqNqJG4wG6HDgiK6AALQFCE4",
  relicAmenhotepColonnade: "https://lh3.googleusercontent.com/aida-public/AB6AXuCBklGRA4yn6IzqJdhFg7-7rHkvIiLgCO0yd1wIsX1Hc6q_mKyZatRRx9OvQOP9bbbkTqGCuyqDpeQNVEJu2S9tf9P5N9ZNzW2ZmV-eyH0vUEv70n8-ODUn1CQI5j-ojSxr0gUxeg2zOlqBntEzNJsAyVAG4yZstraHL4Fq_C5gWwHuRaNn-wJhpTIkI-qfkbnHKcWvTXOR6ivEaHquczWuV8sF7Q-q3PfPwH7dU-Ck6pLpsS7AI5vS9rKtlD9V-4JG_YD5Wpp28rw",
  luxorSatelliteMap: "https://lh3.googleusercontent.com/aida-public/AB6AXuCg_6At2YwBklfULi62gcHb7dpnn3yel0FSXsqIIuJ7eqXI0Mu2UmBciIQ8nwSdMlPKs4VyNaV5bEvpDrfwz6UBVgl84ca9wjLVto5Sh0_YIWyIekrkRIEuC55OH5PsMWej4EzxeUohWdaw3btdcm2vl3oYcTLFyx4KXbTED1X30gPy3yImWflsXI776pDT02LyxPfXcY3hA80Us3qQdeL1urD2yBWn_rvXuXZH4EjENlk94o-e_0l-1clz5Wh30I_QgxwhSnVPe60",
  hotelOberoi: "https://lh3.googleusercontent.com/aida-public/AB6AXuBNdT-80_lTReqtAspxd_bJDaGaS29evBL94z0fPiTWI-5u2zYTDRM0gl63R8JvLd0B37qV6wvRlLFzE3599TNitmpahTHqKrv70JCQRXn0GuQRalCzIjUt8Y0B7IsUCS884cv01wo6BwNE-T68q0lYN1E_ZrXuzj8EwUO1iAeZmOvFmavGBlkIBKnQ5NLM6iXC9y-p08iuvGw2m1Cz86bG682eeNH4d5Ws9d2EVipIJyuA7ebLKgy4dT5p9Pmn_gHxHWhqlgEKT54",
  hotelCataract: "https://lh3.googleusercontent.com/aida-public/AB6AXuAMKU8XSNzzKAxfrhxyT8G4QadrJ5_F2DniqfJLa5Tj34F78zXAuQHQIpRa-aHIa6SdRHh5P4yOcNzzGi6edX4JOK97unTFqAvul-kfbWFsCc3d2uenXi6xaGNYldIVS0GqYtfl0FT-XLMfANzpuqBIIT17IzXuDmkrzYRm-JQ9YJXDqAp_VuZFmuj5AmvCeUXipOj6rtHdZYE1VoD2Oz7c5DAkHTBoLPuc4SZUNKfBHpTlebjXmY6bW1pWiPZ24iggRrIH5QwvEfQ",
   balloonSunrise: "https://lh3.googleusercontent.com/aida-public/AB6AXuC9q_PzWHaofqAs_tCs8DGX7dkJUt0axfxTLA-O1F6pkuFcJaq_A2_aORISFL4WeltQOXp5VBYpwhsUdVxx-MvZRfiK-oBMsDI7vrA08cN3dfIjtqcBHSKlUBVFnCe2k2Arl4B2a59vstwvjpruQeHHH-btwNngikxfFMJfho8OXS9pmEbKhpo66Y9jCI_XNoNSHVzqMNR42stvIleIQqhSmxYJWuJcgsyhKAXljJkHIhCOnytBR92Kp84XNYdxEgM7KaBw70YvqTM",
  pyramidShaded: "https://lh3.googleusercontent.com/aida-public/AB6AXuDKLgiuznwhjl7VhJok3kVFT6HsfiQKHvY1X39ovX_Uhz3LMY6dVykPy_nJKEf0sVcdcPmk3ZlkJh_BEVRdHnMFRlyAdDTTFPBSzuZ3m8PR-A3HGB-FZEaCLlhzhfA12CrgmYovEN35acOLBAXdSmK192PrMUUhqzLAxl62WvlnzBDYDoQfBzj84CRdzkGPhn6rrBm9y6Iwm9Hn2dLVA4cW5dKe8JwV1F21lWfSntvYzXmbx9nx7BnA7C07B-o5Kz-YwrjiImCyMTY",
  karnakColumns: "https://lh3.googleusercontent.com/aida-public/AB6AXuBrDoHEygln8SGalQJFXk6M6-hLKOM4Zrh1IP9_C1zuUkA0YtYwKuwW3LN4q_KfUajtnDLDJ_n00Z-oZMDlEZccAy2SEV-R6y_GSZdYu5PrioOMCP9sf4Q0FLJUYh66a2yo6G7Vnl6AzvKGgtU2F8ouaWrs4AYC93Eh9LVc4h1dmPFj50Q_yWd9iXpSUNdx6VJSoVdAax809w0UN-pU_20Ad9_qNawB1I8_al1UgehMsIBS_nTXDSsp5mN9Tej-bX-cfJEf8GmUQac",
  nileAtlasMap: "https://lh3.googleusercontent.com/aida-public/AB6AXuBmERH6s3qIUtkihdcGcylrBnQM16D5dgppAU8XQ-6mDY6ImAMpVu1p8OEy85xcXmanO8Nn8Sh9sJOd1Ek4FKUhaWHvEdX-ZPhMmkLaOfQ9KS2_G7F-JkeLo7tiYi24EsqkIvysg8Ic1VlIjCHxK9pFB1KdIdF0N9Y_d6zTdIqQaR_WC2DvPDC_VosPuDqVNd23KQvW3P6eBe2ABqCPAFW7dNXMZREPEG9tLxhP_Gw9zOIHnBuL7_OrJHNtSp4Ddc7SOPuWATecBgE",
  alexanderVance: "https://lh3.googleusercontent.com/aida-public/AB6AXuC38Khk_btmkOO0FRQlyGp4cAdI30qE0rb-voVXnUeAsHhKH3tNLBwGXYPcJNjDXH7t5rv3nd9iL0Erf2uCvKViJ0npL1pyQSDIgUlQt8JRyIQ4HsA5yrh5oocZQWAoHPEZvAK_29Y_d0rcsh3kd4XNblNGy5zCL7rlbDusyPGZEjHHL0WmNHJnbBAkJCABYX8HAT5ExVq-NnW7uz1riuhQHgDD0eFyohet7i-ipxEg9cz_iao6nHT6ywY_CrzLBCzVQtgk7sToM1E",
  falconGoldenMascot: "https://lh3.googleusercontent.com/aida-public/AB6AXuA_EbJobh5044wWVpTM-20LfGkWSX60jRXW-c5nzdQZW3SLo5i3Edy-4yN95PbBnmsVKZaMQZYyndvD02nhEidlg4SwgiZ-758LEC1_pawo9deI6C9evXqXnSdraPfHih7S2dsVoq0u7zm7UmdhxaNpJSwM8Q6gTBfbrkPiCUSz3hE1OEx-eMHJW8U0bZiOuQRq4lLBVd48F31VxUYMRszaJEhmet_HCiziGErn8hIy427EI878pteg59NbNxWPe6awduySYm-VFvw",
  headerFalcon: "https://lh3.googleusercontent.com/aida-public/AB6AXuC35_tvrU8rsnV1GrilxmfiEkuefNcUmFv1_EJV4VEIlcWWFlCr8CzX_bwi_tn3jSHDZry90Obc-e3OHKjACit4qROXB_vu5StF91k0X_iciX6-MmUd9jk6JmiO7G0Zz-Wb6PhmCUfE68tD04hgsxWlWqhfXPs-2frNXLEO7W0mhUG-7rtADziVZnZC0MXZi1HYXXTcakbqtWa3Yflq0xdbL8jmjR4pcuhTOMNZGToYjHTPX8drteUn2iv0O2Sr_qsviGg-mQ_w9ec",
  luxorDuskSpires: "https://lh3.googleusercontent.com/aida-public/AB6AXuBCAnqnLzsgd60J801OyUdigWaB2YpjT-V2GOIXZ_eOvyUu62DXCC1IXYBf25_Ad-vTnRjV94MNReUicEzTLjX_LbI27vZJI6du-wtW8BU15XcIPFv3Uut0vRxgshLBYt6F58PlDCpb_01eldJ4-REjf4o3o9VGV6pJK0LelXV-ZhGkxR_bATNIo1nPDXG5egPHXjuttDLXUQKiCPbC9XqSTkm1sN3ywUV7jQsIz-6wECJRw4BzXMZFLHKZEiadRWxlM7Cg-oH8t5U"
};

export const DEFAULT_HIGHLIGHTS = [
  {
    id: "h1",
    title: "Learn Royal Cartouches",
    category: "Hieroglyph Workshop",
    time: "3:00 PM • Near Precinct of Amun-Re",
    icon: "history_edu",
    image: IMAGES.hieroglyphsWorkshop
  },
  {
    id: "h2",
    title: "Sunset Felucca Sail",
    category: "Cultural Experience",
    time: "5:30 PM • Nile Pier 4",
    icon: "sailing",
    image: IMAGES.sunsetSail
  },
  {
    id: "h3",
    title: "Temple of Luxor by Night",
    category: "Exclusive Access",
    time: "8:00 PM • Limited Tickets",
    icon: "flare",
    image: IMAGES.luxorNight
  }
];

export const LUXURY_STAYS = [
  {
    id: "s1",
    name: "The Oberoi Beach Resort",
    location: "Sahl Hasheesh, Red Sea",
    price: "$450/night",
    rating: "4.9 ★",
    imgUrl: IMAGES.hotelOberoi
  },
  {
    id: "s2",
    name: "Old Cataract Hotel",
    location: "Aswan, Nile River",
    price: "$380/night",
    rating: "4.8 ★",
    imgUrl: IMAGES.hotelCataract
  }
];

export const CURATED_TOURS = [
  {
    id: "t1",
    name: "Hot Air Balloon",
    subtitle: "Luxor Sunrise Flight",
    price: "$89",
    imgUrl: IMAGES.balloonSunrise
  },
  {
    id: "t2",
    name: "Private Pyramid Tour",
    subtitle: "After-hours access",
    price: "$150",
    imgUrl: IMAGES.pyramidShaded
  }
];

export const LEADERBOARD: LeaderboardEntry[] = [
  { rank: 141, name: "Marcus Aurelius", xp: "12,450 XP" },
  { rank: 142, name: "You (Tomb Raider)", xp: "12,240 XP", isUser: true },
  { rank: 143, name: "Hatshepsut_99", xp: "12,190 XP" }
];

export const DEFAULT_PLAN: TourPlan = {
  title: "Your Luxor Soul-Journey",
  badge: "3 DAYS IN THE CITY OF HUNDRED GATES",
  days: [
    {
      id: 1,
      title: "Day 1: The Rising Sun",
      items: [
        {
          time: "08:00 AM",
          title: "Karnak Temple Complex",
          description: "Step where pharaohs were crowned. Luxor Temple is not just a structure; it's a living conduit between the mortal and the divine.",
          duration: "3h",
          transport: "Private Transfer",
          rating: 3,
          imgUrl: IMAGES.karnakColumns
        },
        {
          time: "01:00 PM",
          title: "Lunch at Al-Sahaby Lane",
          description: "Traditional rooftop dining overlooking the Avenue of Sphinxes.",
          duration: "1h 30m",
          transport: "10m Walk",
          rating: 2,
          imgUrl: ""
        },
        {
          time: "05:00 PM",
          title: "Luxor Temple Twilight",
          description: "Arrive exactly 20 mins before sunset. The lights turn on just as the sky turns indigo—it's magical.",
          duration: "2h",
          transport: "Easy Guidance",
          rating: 3,
          imgUrl: ""
        }
      ]
    },
    {
      id: 2,
      title: "Day 2: Realm of the West",
      items: [
        {
          time: "08:30 AM",
          title: "Valley of the Kings",
          description: "Descend into pristine subterranean passages painted with astronomical maps of the afterworld.",
          duration: "4h",
          transport: "Private Guide",
          rating: 3,
          imgUrl: ""
        }
      ]
    },
    {
      id: 3,
      title: "Day 3: Echoes of Eternity",
      items: [
        {
          time: "09:00 AM",
          title: "Nile Sunset Felucca Cruise",
          description: "Decompress by drifting on traditional wind-powered feluccas as the sun sets of Elephantine Island.",
          duration: "2h",
          transport: "Nile Boat",
          rating: 3,
          imgUrl: IMAGES.sunsetSail
        }
      ]
    }
  ]
};

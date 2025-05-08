"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  increment,
  orderBy,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Link {
  id: string;
  title: string;
  url: string;
  isPublic: boolean;
  clickCount: number;
  order: number;
}

export default function ProfileContent({ username }: { username: string }) {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clickingId, setClickingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const usernameDoc = await getDoc(doc(db, "usernames", username));
        if (!usernameDoc.exists()) {
          setError("User not found");
          setLoading(false);
          return;
        }

        const userId = usernameDoc.data().userId;

        const linksRef = collection(db, "links");
        const q = query(
          linksRef,
          where("userId", "==", userId),
          orderBy("order", "asc")
        );
        const querySnapshot = await getDocs(q);

        const fetchedLinks = (
          querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Link[]
        )
          .filter((link: Link) => link.isPublic)
          .sort((a: Link, b: Link) => (a.order || 0) - (b.order || 0));

        setLinks(fetchedLinks);
      } catch (err) {
        console.error("Error fetching links:", err);
        setError("Failed to load links");
      } finally {
        setLoading(false);
      }
    };

    fetchLinks();
  }, [username]);

  const handleClick = async (linkId: string, url: string) => {
    setClickingId(linkId);
    try {
      const linkRef = doc(db, "links", linkId);
      await updateDoc(linkRef, {
        clickCount: increment(1),
      });

      setLinks(
        links.map((link) =>
          link.id === linkId
            ? { ...link, clickCount: (link.clickCount || 0) + 1 }
            : link
        )
      );

      window.open(url, "_blank");
    } catch (err) {
      console.error("Error updating click count:", err);
    } finally {
      setClickingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center">
            <div className="flex justify-center">
              <svg
                className="animate-spin h-8 w-8 text-indigo-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
            <p className="mt-2 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">{error}</h1>
          </div>
        </div>
      </div>
    );
  }

  if (links.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">@{username}</h1>
            <p className="mt-2 text-gray-600">No public links available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">@{username}</h1>
        </div>
        <div className="space-y-4">
          {links.map((link) => (
            <button
              key={link.id}
              onClick={() => handleClick(link.id, link.url)}
              disabled={clickingId === link.id}
              className="w-full flex items-center justify-between p-4 bg-white rounded-lg shadow hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex-1 text-left">
                <h3 className="font-medium text-gray-900">{link.title}</h3>
                <p className="text-sm text-gray-500">{link.url}</p>
              </div>
              <div className="ml-4 flex items-center">
                <span className="text-sm text-gray-500 mr-2">
                  {link.clickCount || 0} clicks
                </span>
                {clickingId === link.id ? (
                  <svg
                    className="animate-spin h-5 w-5 text-indigo-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

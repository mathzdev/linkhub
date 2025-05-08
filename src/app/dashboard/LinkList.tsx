"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  orderBy,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useSession } from "next-auth/react";

interface Link {
  id: string;
  title: string;
  url: string;
  userId: string;
  order: number;
  isPublic: boolean;
  clickCount: number;
}

export default function LinkList() {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }

    const fetchLinks = async () => {
      try {
        const userId = session.user.id;
        console.log("Fetching links for user:", userId);

        const linksRef = collection(db, "links");
        const q = query(
          linksRef,
          where("userId", "==", userId),
          orderBy("order", "asc")
        );
        const querySnapshot = await getDocs(q);

        const fetchedLinks = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Link[];

        console.log("Fetched links:", fetchedLinks);
        setLinks(fetchedLinks);
      } catch (err) {
        console.error("Error fetching links:", err);
        setError("Failed to load links. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchLinks();
  }, [session, status]);

  const handleDelete = async (linkId: string) => {
    if (!session?.user?.id) {
      setError("You must be signed in to delete links");
      return;
    }

    setDeletingId(linkId);
    try {
      console.log("Deleting link:", linkId);
      await deleteDoc(doc(db, "links", linkId));
      setLinks(links.filter((link) => link.id !== linkId));
    } catch (err) {
      console.error("Error deleting link:", err);
      setError("Failed to delete link. Please try again later.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleVisibilityToggle = async (
    linkId: string,
    currentVisibility: boolean
  ) => {
    if (!session?.user?.id) return;

    setUpdatingId(linkId);
    try {
      const linkRef = doc(db, "links", linkId);
      await updateDoc(linkRef, {
        isPublic: !currentVisibility,
      });
      setLinks(
        links.map((link) =>
          link.id === linkId ? { ...link, isPublic: !currentVisibility } : link
        )
      );
    } catch (err) {
      console.error("Error updating link visibility:", err);
      setError("Failed to update link visibility");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleMove = async (linkId: string, direction: "up" | "down") => {
    if (!session?.user?.id) return;

    const currentIndex = links.findIndex((link) => link.id === linkId);
    if (
      (direction === "up" && currentIndex === 0) ||
      (direction === "down" && currentIndex === links.length - 1)
    ) {
      return;
    }

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const newLinks = [...links];
    const [movedLink] = newLinks.splice(currentIndex, 1);
    newLinks.splice(newIndex, 0, movedLink);

    const updatedLinks = newLinks.map((link, index) => ({
      ...link,
      order: index,
    }));

    setUpdatingId(linkId);
    try {
      const batch = writeBatch(db);
      updatedLinks.forEach((link) => {
        const linkRef = doc(db, "links", link.id);
        batch.update(linkRef, { order: link.order });
      });
      await batch.commit();

      setLinks(updatedLinks);
    } catch (err) {
      console.error("Error reordering links:", err);
      setError("Failed to reorder links");
    } finally {
      setUpdatingId(null);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="text-center py-4">
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
        <p className="mt-2 text-gray-600">Loading links...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-4">
        {error}
        <button
          onClick={() => setError(null)}
          className="ml-2 text-sm underline hover:text-red-600"
        >
          Dismiss
        </button>
      </div>
    );
  }

  if (!session?.user?.id) {
    return (
      <div className="text-center py-4">Please sign in to view your links</div>
    );
  }

  if (links.length === 0) {
    return <div className="text-center py-4">No links added yet</div>;
  }

  return (
    <div className="space-y-4">
      {links.map((link, index) => (
        <div
          key={link.id}
          className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
        >
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-gray-900">{link.title}</h3>
              <span className="text-sm text-gray-500 ml-2">
                ({link.clickCount} clicks)
              </span>
            </div>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              {link.url}
            </a>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleMove(link.id, "up")}
              disabled={index === 0 || updatingId === link.id}
              className="text-gray-600 hover:text-gray-900 disabled:opacity-50"
            >
              ↑
            </button>
            <button
              onClick={() => handleMove(link.id, "down")}
              disabled={index === links.length - 1 || updatingId === link.id}
              className="text-gray-600 hover:text-gray-900 disabled:opacity-50"
            >
              ↓
            </button>
            <button
              onClick={() => handleVisibilityToggle(link.id, link.isPublic)}
              disabled={updatingId === link.id}
              className={`px-2 py-1 text-sm rounded ${
                link.isPublic
                  ? "bg-green-200 text-gray-900 hover:bg-green-300"
                  : "bg-gray-200 text-gray-900 hover:bg-gray-300"
              } disabled:opacity-50`}
            >
              {updatingId === link.id ? (
                <svg
                  className="animate-spin h-4 w-4"
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
              ) : link.isPublic ? (
                "Public"
              ) : (
                "Private"
              )}
            </button>
            <button
              onClick={() => handleDelete(link.id)}
              disabled={deletingId === link.id}
              className="text-red-600 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {deletingId === link.id ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-600"
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
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

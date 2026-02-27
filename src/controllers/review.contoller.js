import supabase from "../config/supabase.js";

const verifyTripOwner = async (tripId, userId) => {
  const { data } = await supabase
    .from("trips")
    .select("user_id")
    .eq("id", tripId)
    .single();
  return data && data.user_id === userId;
};

export const getReviews = async (req, res) => {
  try {
    const owned = await verifyTripOwner(req.params.tripId, req.user.id);
    if (!owned) return res.status(403).json({ error: "Access denied" });
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("trip_id", req.params.tripId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json({ reviews: data });
  } catch {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
};

export const addReview = async (req, res) => {
  try {
    const owned = await verifyTripOwner(req.params.tripId, req.user.id);
    if (!owned) return res.status(403).json({ error: "Access denied" });
    const {
      place_name,
      category,
      rating,
      review_text,
      photos,
      visited_date,
      itinerary_item_id,
    } = req.body;
    const { data, error } = await supabase
      .from("reviews")
      .insert([
        {
          trip_id: req.params.tripId,
          user_id: req.user.id,
          place_name,
          category,
          rating,
          review_text,
          photos: photos || [],
          visited_date,
          itinerary_item_id,
        },
      ])
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ review: data });
  } catch {
    res.status(500).json({ error: "Failed to add review" });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { data: rev } = await supabase
      .from("reviews")
      .select("user_id")
      .eq("id", req.params.id)
      .single();
    if (!rev || rev.user_id !== req.user.id)
      return res.status(403).json({ error: "Access denied" });
    await supabase.from("reviews").delete().eq("id", req.params.id);
    res.json({ message: "Review deleted" });
  } catch {
    res.status(500).json({ error: "Failed to delete review" });
  }
};

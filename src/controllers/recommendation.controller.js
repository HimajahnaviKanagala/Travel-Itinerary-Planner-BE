import supabase from "../config/supabase.js";

export const getRecommendations = async (req, res) => {
  try {
    const { tripId } = req.params;

    const { data: trip, error: tripError } = await supabase
      .from("trips")
      .select("destination_country")
      .eq("id", tripId)
      .single();

    if (tripError) {
      console.error("Trip fetch error:", tripError);
      return res.status(404).json({ error: "Trip not found" });
    }

    const { data: tripRecs, error: err1 } = await supabase
      .from("activity_recommendations")
      .select("*")
      .eq("trip_id", tripId)
      .order("created_at", { ascending: false });

    if (err1) {
      console.error("Trip recs error:", err1);
      return res.status(500).json({ error: err1.message });
    }

    const { data: destRecs, error: err2 } = await supabase
      .from("activity_recommendations")
      .select("*")
      .ilike("destination", `%${trip.destination_country}%`)
      .is("trip_id", null)
      .order("created_at", { ascending: false });

    if (err2) {
      console.error("Destination recs error:", err2);
      return res.status(500).json({ error: err2.message });
    }

    const all = [...(tripRecs || []), ...(destRecs || [])];
    const unique = all.filter(
      (rec, index, self) => index === self.findIndex((r) => r.id === rec.id),
    );

    res.json({ recommendations: unique });
  } catch (err) {
    console.error("Get recommendations error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const addRecommendation = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { title, description, category, price_range, rating } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    // Get trip destination to store with the rec
    const { data: trip } = await supabase
      .from("trips")
      .select("destination_country")
      .eq("id", tripId)
      .single();

    const { data, error } = await supabase
      .from("activity_recommendations")
      .insert([
        {
          trip_id: tripId,
          title,
          description: description || null,
          category: category || "Other",
          destination: trip?.destination_country || null, // ← your column
          price_range: price_range || null,
          rating: rating ? parseFloat(rating) : null,
          created_by: req.user.id,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ recommendation: data });
  } catch (err) {
    console.error("Add recommendation error:", err);
    res.status(500).json({ error: "Failed to add recommendation" });
  }
};

export const getAllRecommendations = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("activity_recommendations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({ recommendations: data || [] });
  } catch (err) {
    console.error("Get all recommendations error:", err);
    res.status(500).json({ error: "Failed to fetch recommendations" });
  }
};

export const createRecommendation = async (req, res) => {
  try {
    const { title, description, category, destination, price_range, rating } =
      req.body;

    if (!title) return res.status(400).json({ error: "Title is required" });
    if (!destination)
      return res.status(400).json({ error: "Destination is required" });

    const { data, error } = await supabase
      .from("activity_recommendations")
      .insert([
        {
          trip_id: null, // global rec — not tied to a specific trip
          title,
          description: description || null,
          category: category || "Other",
          destination, // ← your column, required in your table
          price_range: price_range || null,
          rating: rating ? parseFloat(rating) : null,
          created_by: req.user.id,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ recommendation: data });
  } catch (err) {
    console.error("Create recommendation error:", err);
    res.status(500).json({ error: "Failed to create recommendation" });
  }
};

export const deleteRecommendation = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("activity_recommendations")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("Delete recommendation error:", err);
    res.status(500).json({ error: "Failed to delete recommendation" });
  }
};

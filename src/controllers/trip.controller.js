import supabase from "../config/supabase.js";

export const getTrips = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = supabase
      .from("trips")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false });

    if (status) query = query.eq("status", status);
    if (search) query = query.ilike("title", `%${search}%`);

    const { data, error } = await query;
    if (error) throw error;
    res.json({ trips: data });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch trips" });
  }
};

export const getTripById = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("trips")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (error || !data)
      return res.status(404).json({ error: "Trip not found" });
    if (data.user_id !== req.user.id)
      return res.status(403).json({ error: "Access denied" });

    res.json({ trip: data });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch trip" });
  }
};

export const createTrip = async (req, res) => {
  try {
    const {
      title,
      description,
      start_date,
      end_date,
      destination_country,
      budget,
      currency,
      cover_image,
      status,
    } = req.body;
    const { data, error } = await supabase
      .from("trips")
      .insert([
        {
          user_id: req.user.id,
          title,
          description,
          start_date,
          end_date,
          destination_country,
          budget,
          currency: currency || "USD",
          cover_image,
          status: status || "planning",
        },
      ])
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ trip: data });
  } catch (err) {
    res.status(500).json({ error: "Failed to create trip" });
  }
};

export const updateTrip = async (req, res) => {
  try {
    const { data: existing } = await supabase
      .from("trips")
      .select("user_id")
      .eq("id", req.params.id)
      .single();
    if (!existing || existing.user_id !== req.user.id)
      return res.status(403).json({ error: "Access denied" });

    const {
      title,
      description,
      start_date,
      end_date,
      destination_country,
      budget,
      currency,
      cover_image,
      status,
      is_shared,
    } = req.body;
    const { data, error } = await supabase
      .from("trips")
      .update({
        title,
        description,
        start_date,
        end_date,
        destination_country,
        budget,
        currency,
        cover_image,
        status,
        is_shared,
      })
      .eq("id", req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ trip: data });
  } catch (err) {
    res.status(500).json({ error: "Failed to update trip" });
  }
};

export const deleteTrip = async (req, res) => {
  try {
    const { data: existing } = await supabase
      .from("trips")
      .select("user_id")
      .eq("id", req.params.id)
      .single();
    if (!existing || existing.user_id !== req.user.id)
      return res.status(403).json({ error: "Access denied" });
    await supabase.from("trips").delete().eq("id", req.params.id);
    res.json({ message: "Trip deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete trip" });
  }
};

export const getTripStats = async (req, res) => {
  try {
    const { data: trip } = await supabase
      .from("trips")
      .select("user_id, budget")
      .eq("id", req.params.id)
      .single();
    if (!trip || trip.user_id !== req.user.id)
      return res.status(403).json({ error: "Access denied" });

    const [{ data: expenses }, { data: items }, { data: packing }] =
      await Promise.all([
        supabase
          .from("expenses")
          .select("amount, category")
          .eq("trip_id", req.params.id),
        supabase
          .from("itinerary_items")
          .select("id")
          .eq("trip_id", req.params.id),
        supabase
          .from("packing_lists")
          .select("is_packed")
          .eq("trip_id", req.params.id),
      ]);

    const totalSpent = (expenses || []).reduce(
      (s, e) => s + parseFloat(e.amount || 0),
      0,
    );
    const packedCount = (packing || []).filter((p) => p.is_packed).length;

    res.json({
      stats: {
        totalSpent,
        budget: parseFloat(trip.budget || 0),
        remaining: parseFloat(trip.budget || 0) - totalSpent,
        activityCount: (items || []).length,
        packingTotal: (packing || []).length,
        packingPacked: packedCount,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to get stats" });
  }
};

import supabase from "../config/supabase.js";

const verifyTripOwner = async (tripId, userId) => {
  const { data } = await supabase
    .from("trips")
    .select("user_id")
    .eq("id", tripId)
    .single();
  return data && data.user_id === userId;
};

export const getExpenses = async (req, res) => {
  try {
    const owned = await verifyTripOwner(req.params.tripId, req.user.id);
    if (!owned) return res.status(403).json({ error: "Access denied" });

    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("trip_id", req.params.tripId)
      .order("date", { ascending: false });
    if (error) throw error;

    const summary = data.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + parseFloat(e.amount);
      return acc;
    }, {});

    res.json({ expenses: data, summary });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
};

export const addExpense = async (req, res) => {
  try {
    const owned = await verifyTripOwner(req.params.tripId, req.user.id);
    if (!owned) return res.status(403).json({ error: "Access denied" });

    const { category, amount, currency, description, date, receipt_url } =
      req.body;
    const { data, error } = await supabase
      .from("expenses")
      .insert([
        {
          trip_id: req.params.tripId,
          user_id: req.user.id,
          category,
          amount,
          currency: currency || "USD",
          description,
          date,
          receipt_url,
        },
      ])
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ expense: data });
  } catch (err) {
    res.status(500).json({ error: "Failed to add expense" });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const { data: exp } = await supabase
      .from("expenses")
      .select("trip_id, user_id")
      .eq("id", req.params.id)
      .single();
    if (!exp || exp.user_id !== req.user.id)
      return res.status(403).json({ error: "Access denied" });

    const { data, error } = await supabase
      .from("expenses")
      .update(req.body)
      .eq("id", req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ expense: data });
  } catch (err) {
    res.status(500).json({ error: "Failed to update expense" });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const { data: exp } = await supabase
      .from("expenses")
      .select("user_id")
      .eq("id", req.params.id)
      .single();
    if (!exp || exp.user_id !== req.user.id)
      return res.status(403).json({ error: "Access denied" });
    await supabase.from("expenses").delete().eq("id", req.params.id);
    res.json({ message: "Expense deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete expense" });
  }
};

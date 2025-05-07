import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectItem } from "@/components/ui/select";

export default function TugboatScheduler() {
  const [trips, setTrips] = useState([]);
  const [filter, setFilter] = useState("All");
  const [form, setForm] = useState({
    contractor: "",
    date: "",
    location: "",
    serviceType: "",
    notes: "",
    invoice: null,
  });

  useEffect(() => {
    const savedTrips = localStorage.getItem("tugboat_trips");
    if (savedTrips) {
      setTrips(JSON.parse(savedTrips));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("tugboat_trips", JSON.stringify(trips));
  }, [trips]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "invoice") {
      setForm({ ...form, invoice: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const addTrip = () => {
    setTrips([...trips, { ...form, status: "Pending", verified: null }]);
    setForm({ contractor: "", date: "", location: "", serviceType: "", notes: "", invoice: null });
  };

  const downloadInvoice = (invoice) => {
    if (!invoice) return;
    const url = URL.createObjectURL(invoice);
    const link = document.createElement("a");
    link.href = url;
    link.download = invoice.name;
    link.click();
    URL.revokeObjectURL(url);
  };

  const verifyInvoice = (index, result) => {
    const updatedTrips = [...trips];
    updatedTrips[index].verified = result;
    updatedTrips[index].status = result === true ? "Approved" : "Rejected";
    setTrips(updatedTrips);
  };

  const filteredTrips = trips.filter((trip) => {
    if (filter === "All") return true;
    return trip.status === filter;
  });

  const exportCSV = () => {
    const headers = ["Contractor", "Date", "Location", "Service Type", "Status", "Notes", "Invoice Status"];
    const rows = filteredTrips.map((trip) => [
      trip.contractor,
      trip.date,
      trip.location,
      trip.serviceType,
      trip.status,
      trip.notes,
      trip.verified === null ? "Pending" : trip.verified ? "Approved" : "Rejected",
    ]);
    const csvContent = [headers, ...rows]
      .map((e) => e.map((v) => `"${v}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "tugboat_trips.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardContent className="space-y-4 p-4">
          <h2 className="text-xl font-semibold">Schedule New Tugboat Job</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Contractor</Label>
              <Input name="contractor" value={form.contractor} onChange={handleChange} />
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" name="date" value={form.date} onChange={handleChange} />
            </div>
            <div>
              <Label>Location</Label>
              <Input name="location" value={form.location} onChange={handleChange} />
            </div>
            <div>
              <Label>Service Type</Label>
              <Input name="serviceType" value={form.serviceType} onChange={handleChange} />
            </div>
            <div className="col-span-2">
              <Label>Notes</Label>
              <Textarea name="notes" value={form.notes} onChange={handleChange} />
            </div>
            <div className="col-span-2">
              <Label>Upload Invoice</Label>
              <Input type="file" name="invoice" accept="application/pdf,image/*" onChange={handleChange} />
            </div>
          </div>
          <Button onClick={addTrip}>Add Trip</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Scheduled Trips</h2>
            <div className="flex items-center space-x-2">
              <Label>Status Filter</Label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border rounded p-1"
              >
                <option value="All">All</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
              <Button onClick={exportCSV}>Export CSV</Button>
            </div>
          </div>

          <div className="space-y-2">
            {filteredTrips.map((trip, idx) => (
              <div key={idx} className="border p-3 rounded-md shadow-sm space-y-2">
                <div><strong>Contractor:</strong> {trip.contractor}</div>
                <div><strong>Date:</strong> {trip.date}</div>
                <div><strong>Location:</strong> {trip.location}</div>
                <div><strong>Service:</strong> {trip.serviceType}</div>
                <div><strong>Status:</strong> {trip.status}</div>
                <div><strong>Notes:</strong> {trip.notes}</div>
                <div>
                  <strong>Invoice:</strong> {trip.invoice ? (
                    <Button variant="outline" size="sm" onClick={() => downloadInvoice(trip.invoice)}>
                      Download Invoice
                    </Button>
                  ) : "No invoice uploaded"}
                </div>
                {trip.invoice && trip.verified === null && (
                  <div className="space-x-2">
                    <Button variant="success" size="sm" onClick={() => verifyInvoice(idx, true)}>
                      Approve Invoice
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => verifyInvoice(idx, false)}>
                      Reject Invoice
                    </Button>
                  </div>
                )}
                {trip.verified !== null && (
                  <div>
                    <strong>Invoice Status:</strong> {trip.verified ? "✅ Approved" : "❌ Rejected"}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

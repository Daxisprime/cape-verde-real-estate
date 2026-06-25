"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, User, Phone, Mail, MapPin, CheckCircle, AlertCircle, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Property {
  id: string;
  title: string;
  location: string;
  image: string;
  agent: {
    name: string;
    phone: string;
    email: string;
  };
}

interface ViewingSlot {
  id: string;
  date: string;
  time: string;
  duration: number; // in minutes
  available: boolean;
  booked?: {
    clientName: string;
    clientEmail: string;
    clientPhone: string;
  };
}

interface Viewing {
  id: string;
  propertyId: string;
  property: Property;
  date: string;
  time: string;
  duration: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  clientInfo: {
    name: string;
    email: string;
    phone: string;
    notes?: string;
  };
  agentNotes?: string;
  createdAt: string;
}

interface ViewingSchedulerProps {
  isOpen: boolean;
  onClose: () => void;
  property?: Property;
  mode?: 'book' | 'manage';
}

const sampleProperty: Property = {
  id: "1",
  title: "Modern Beachfront Villa",
  location: "Santa Maria, Sal",
  image: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/522602290.jpg",
  agent: {
    name: "Maria Santos",
    phone: "+238 260 1234",
    email: "maria.santos@atlanticre.cv"
  }
};

const generateTimeSlots = (date: string): ViewingSlot[] => {
  const slots: ViewingSlot[] = [];
  const startHour = 9;
  const endHour = 18;

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

      // Simulate some slots being booked
      const isBooked = Math.random() < 0.3;

      slots.push({
        id: `${date}-${timeString}`,
        date,
        time: timeString,
        duration: 30,
        available: !isBooked,
        booked: isBooked ? {
          clientName: "John Doe",
          clientEmail: "john@example.com",
          clientPhone: "+238 123 4567"
        } : undefined
      });
    }
  }

  return slots;
};

const sampleViewings: Viewing[] = [
  {
    id: "1",
    propertyId: "1",
    property: sampleProperty,
    date: "2024-12-30",
    time: "14:00",
    duration: 60,
    status: "confirmed",
    clientInfo: {
      name: "João Silva",
      email: "joao@example.com",
      phone: "+238 987 6543",
      notes: "Interested in investment properties. Looking for ocean view."
    },
    agentNotes: "Client is very serious. Bring property brochures.",
    createdAt: "2024-12-28T10:30:00Z"
  }
];

export default function ViewingScheduler({ isOpen, onClose, property = sampleProperty, mode = 'book' }: ViewingSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<ViewingSlot[]>([]);
  const [viewings, setViewings] = useState<Viewing[]>(sampleViewings);
  const [currentStep, setCurrentStep] = useState<'date' | 'details' | 'confirmation'>('date');
  const [bookingDetails, setBookingDetails] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
    duration: 30
  });
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Initialize with current date
  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    setSelectedDate(dateString);
    setAvailableSlots(generateTimeSlots(dateString));
  }, []);

  // Update available slots when date changes
  useEffect(() => {
    if (selectedDate) {
      setAvailableSlots(generateTimeSlots(selectedDate));
    }
  }, [selectedDate]);

  // Pre-fill user details if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setBookingDetails(prev => ({
        ...prev,
        name: user.name,
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [isAuthenticated, user]);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setSelectedTime('');
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setCurrentStep('details');
  };

  const handleBookingSubmit = async () => {
    if (!selectedDate || !selectedTime || !bookingDetails.name || !bookingDetails.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newViewing: Viewing = {
        id: Date.now().toString(),
        propertyId: property.id,
        property,
        date: selectedDate,
        time: selectedTime,
        duration: bookingDetails.duration,
        status: 'pending',
        clientInfo: {
          name: bookingDetails.name,
          email: bookingDetails.email,
          phone: bookingDetails.phone,
          notes: bookingDetails.notes
        },
        createdAt: new Date().toISOString()
      };

      setViewings(prev => [...prev, newViewing]);
      setCurrentStep('confirmation');

      toast({
        title: "Viewing Scheduled!",
        description: `Your viewing for ${property.title} is scheduled for ${formatDate(selectedDate)} at ${selectedTime}.`,
      });

    } catch (error) {
      toast({
        title: "Booking Failed",
        description: "Please try again or contact the agent directly.",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: Viewing['status']) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const generateDateOptions = () => {
    const options = [];
    const today = new Date();

    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      // Skip Sundays for property viewings
      if (date.getDay() !== 0) {
        const dateString = date.toISOString().split('T')[0];
        const displayDate = date.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        });

        options.push({ value: dateString, label: displayDate });
      }
    }

    return options;
  };

  if (mode === 'manage') {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Viewing Management
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{viewings.length}</div>
                  <div className="text-sm text-gray-600">Total Viewings</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {viewings.filter(v => v.status === 'confirmed').length}
                  </div>
                  <div className="text-sm text-gray-600">Confirmed</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {viewings.filter(v => v.status === 'pending').length}
                  </div>
                  <div className="text-sm text-gray-600">Pending</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-gray-600">
                    {viewings.filter(v => v.status === 'completed').length}
                  </div>
                  <div className="text-sm text-gray-600">Completed</div>
                </CardContent>
              </Card>
            </div>

            {/* Viewings List */}
            <Card>
              <CardHeader>
                <CardTitle>Scheduled Viewings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {viewings.map((viewing) => (
                    <Card key={viewing.id} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="w-16 h-16 relative rounded overflow-hidden">
                              <img
                                src={viewing.property.image}
                                alt={viewing.property.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{viewing.property.title}</h3>
                              <div className="flex items-center text-gray-600 text-sm mt-1">
                                <MapPin className="h-3 w-3 mr-1" />
                                {viewing.property.location}
                              </div>
                              <div className="flex items-center text-gray-600 text-sm mt-2">
                                <Calendar className="h-3 w-3 mr-1" />
                                {formatDate(viewing.date)} at {viewing.time}
                                <Clock className="h-3 w-3 ml-3 mr-1" />
                                {viewing.duration} minutes
                              </div>
                              <div className="flex items-center text-gray-600 text-sm mt-1">
                                <User className="h-3 w-3 mr-1" />
                                {viewing.clientInfo.name}
                                <Mail className="h-3 w-3 ml-3 mr-1" />
                                {viewing.clientInfo.email}
                                <Phone className="h-3 w-3 ml-3 mr-1" />
                                {viewing.clientInfo.phone}
                              </div>
                              {viewing.clientInfo.notes && (
                                <div className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded">
                                  <strong>Client Notes:</strong> {viewing.clientInfo.notes}
                                </div>
                              )}
                              {viewing.agentNotes && (
                                <div className="text-sm text-gray-600 mt-2 p-2 bg-blue-50 rounded">
                                  <strong>Agent Notes:</strong> {viewing.agentNotes}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <Badge className={getStatusColor(viewing.status)}>
                              {viewing.status.charAt(0).toUpperCase() + viewing.status.slice(1)}
                            </Badge>
                            <div className="flex space-x-2">
                              {viewing.status === 'pending' && (
                                <>
                                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Confirm
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    Reschedule
                                  </Button>
                                </>
                              )}
                              {viewing.status === 'confirmed' && (
                                <>
                                  <Button size="sm" variant="outline">
                                    Complete
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    Cancel
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Schedule Property Viewing
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Property Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 relative rounded overflow-hidden">
                  <img
                    src={property.image}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{property.title}</h3>
                  <div className="flex items-center text-gray-600 text-sm">
                    <MapPin className="h-3 w-3 mr-1" />
                    {property.location}
                  </div>
                  <div className="flex items-center text-gray-600 text-sm mt-1">
                    <User className="h-3 w-3 mr-1" />
                    {property.agent.name}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {currentStep === 'date' && (
            <div className="space-y-4">
              {/* Date Selection */}
              <div>
                <Label htmlFor="date">Select Date</Label>
                <Select value={selectedDate} onValueChange={handleDateChange}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose a date" />
                  </SelectTrigger>
                  <SelectContent>
                    {generateDateOptions().map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Time Slots */}
              {selectedDate && (
                <div>
                  <Label>Available Time Slots</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {availableSlots.map((slot) => (
                      <Button
                        key={slot.id}
                        variant={slot.available ? "outline" : "ghost"}
                        disabled={!slot.available}
                        onClick={() => handleTimeSelect(slot.time)}
                        className={`text-sm ${
                          slot.available
                            ? 'hover:bg-blue-50 hover:border-blue-300'
                            : 'opacity-50 cursor-not-allowed'
                        }`}
                      >
                        {slot.time}
                        {!slot.available && (
                          <X className="h-3 w-3 ml-1 text-red-500" />
                        )}
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    All times are in Cape Verde Time (CVT). Each viewing slot is 30 minutes.
                  </p>
                </div>
              )}
            </div>
          )}

          {currentStep === 'details' && (
            <div className="space-y-4">
              {/* Selected Time Confirmation */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Selected Time</h4>
                      <p className="text-sm text-gray-600">
                        {formatDate(selectedDate)} at {selectedTime}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentStep('date')}
                    >
                      Change
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={bookingDetails.name}
                    onChange={(e) => setBookingDetails(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your full name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={bookingDetails.email}
                    onChange={(e) => setBookingDetails(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={bookingDetails.phone}
                    onChange={(e) => setBookingDetails(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter your phone number"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="duration">Viewing Duration</Label>
                  <Select
                    value={bookingDetails.duration.toString()}
                    onValueChange={(value) => setBookingDetails(prev => ({ ...prev, duration: Number(value) }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={bookingDetails.notes}
                  onChange={(e) => setBookingDetails(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any specific questions or requirements for the viewing..."
                  className="mt-1"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setCurrentStep('date')}>
                  Back
                </Button>
                <Button onClick={handleBookingSubmit} className="bg-blue-600 hover:bg-blue-700">
                  Schedule Viewing
                </Button>
              </div>
            </div>
          )}

          {currentStep === 'confirmation' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold">Viewing Scheduled!</h3>
              <p className="text-gray-600">
                Your viewing for <strong>{property.title}</strong> has been scheduled for{' '}
                <strong>{formatDate(selectedDate)} at {selectedTime}</strong>.
              </p>

              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">What's Next?</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• You'll receive a confirmation email shortly</li>
                    <li>• The agent will contact you 24 hours before the viewing</li>
                    <li>• Please arrive 5 minutes early at the property</li>
                    <li>• Bring a valid ID for verification</li>
                  </ul>
                </CardContent>
              </Card>

              <div className="flex justify-center space-x-4">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Add to Calendar
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

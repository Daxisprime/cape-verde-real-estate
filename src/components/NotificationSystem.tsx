"use client";

import { useState, useEffect } from "react";
import { Bell, X, Eye, Heart, TrendingDown, TrendingUp, Home, Calendar, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";

interface Notification {
  id: string;
  type: 'price_drop' | 'price_increase' | 'new_listing' | 'viewing_reminder' | 'saved_property_update' | 'alert_match';
  title: string;
  message: string;
  propertyId?: string;
  propertyImage?: string;
  propertyTitle?: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
}

interface NotificationSystemProps {
  isOpen: boolean;
  onClose: () => void;
}

const sampleNotifications: Notification[] = [
  {
    id: "1",
    type: "price_drop",
    title: "Price Dropped!",
    message: "Modern Beachfront Villa price reduced by €15,000 (3.3%)",
    propertyId: "1",
    propertyImage: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/522602290.jpg",
    propertyTitle: "Modern Beachfront Villa",
    timestamp: "2024-12-28T10:30:00Z",
    read: false,
    priority: "high",
    actionUrl: "/property/1"
  },
  {
    id: "2",
    type: "new_listing",
    title: "New Property Match",
    message: "A new villa in Sal matches your search alert 'Beachfront Villas'",
    propertyId: "3",
    propertyImage: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    propertyTitle: "Luxury Ocean Villa",
    timestamp: "2024-12-28T09:15:00Z",
    read: false,
    priority: "medium",
    actionUrl: "/property/3"
  },
  {
    id: "3",
    type: "viewing_reminder",
    title: "Viewing Reminder",
    message: "Property viewing scheduled for tomorrow at 2:00 PM",
    propertyId: "2",
    propertyImage: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    propertyTitle: "City Center Apartment",
    timestamp: "2024-12-28T08:00:00Z",
    read: false,
    priority: "high",
    actionUrl: "/dashboard?tab=schedule"
  },
  {
    id: "4",
    type: "saved_property_update",
    title: "Property Updated",
    message: "New photos added to your saved property",
    propertyId: "1",
    propertyTitle: "Modern Beachfront Villa",
    timestamp: "2024-12-27T16:45:00Z",
    read: true,
    priority: "low",
    actionUrl: "/property/1"
  },
  {
    id: "5",
    type: "alert_match",
    title: "Search Alert Match",
    message: "3 new properties match your 'Praia Apartments' alert",
    timestamp: "2024-12-27T14:30:00Z",
    read: true,
    priority: "medium",
    actionUrl: "/search?alert=praia-apartments"
  }
];

export default function NotificationSystem({ isOpen, onClose }: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      // Load notifications from storage or API
      setNotifications(sampleNotifications);
      setUnreadCount(sampleNotifications.filter(n => !n.read).length);

      // Simulate real-time notifications
      const interval = setInterval(() => {
        // Simulate new notification every 30 seconds (for demo)
        const chance = Math.random();
        if (chance < 0.1) { // 10% chance every 30 seconds
          addNewNotification();
        }
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const addNewNotification = () => {
    const newNotificationTypes = [
      {
        type: 'price_drop' as const,
        title: 'Price Alert!',
        message: 'Property in your watchlist just dropped price by €8,000',
        priority: 'high' as const
      },
      {
        type: 'new_listing' as const,
        title: 'New Listing',
        message: 'New apartment in Praia matches your criteria',
        priority: 'medium' as const
      }
    ];

    const randomNotification = newNotificationTypes[Math.floor(Math.random() * newNotificationTypes.length)];

    const newNotification: Notification = {
      id: `new-${Date.now()}`,
      ...randomNotification,
      timestamp: new Date().toISOString(),
      read: false,
      actionUrl: '/dashboard'
    };

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification(newNotification.title, {
        body: newNotification.message,
        icon: '/favicon.ico'
      });
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const deleteNotification = (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'price_drop': return TrendingDown;
      case 'price_increase': return TrendingUp;
      case 'new_listing': return Home;
      case 'viewing_reminder': return Calendar;
      case 'saved_property_update': return Heart;
      case 'alert_match': return Bell;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'price_drop': return 'text-green-600';
      case 'price_increase': return 'text-red-600';
      case 'new_listing': return 'text-blue-600';
      case 'viewing_reminder': return 'text-purple-600';
      case 'saved_property_update': return 'text-pink-600';
      case 'alert_match': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityBadgeColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notifications
              {unreadCount > 0 && (
                <Badge className="ml-2 bg-red-600 text-white">
                  {unreadCount}
                </Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                Mark all read
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[500px]">
          <div className="px-6 pb-6">
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                <p className="text-gray-600">You're all caught up!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => {
                  const IconComponent = getNotificationIcon(notification.type);
                  const iconColor = getNotificationColor(notification.type);

                  return (
                    <Card
                      key={notification.id}
                      className={`relative transition-all cursor-pointer ${
                        !notification.read ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                      }`}
                      onClick={() => {
                        if (!notification.read) markAsRead(notification.id);
                        if (notification.actionUrl) {
                          window.location.href = notification.actionUrl;
                        }
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-full bg-white ${iconColor}`}>
                            <IconComponent className="h-4 w-4" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium text-sm text-gray-900 truncate">
                                {notification.title}
                              </h4>
                              <div className="flex items-center space-x-1">
                                {notification.priority === 'high' && (
                                  <AlertTriangle className="h-3 w-3 text-red-600" />
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0 text-gray-400 hover:text-gray-600"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notification.id);
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>

                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                              {notification.message}
                            </p>

                            {notification.propertyTitle && (
                              <div className="flex items-center space-x-2 mb-2">
                                {notification.propertyImage && (
                                  <div className="w-8 h-8 relative rounded overflow-hidden">
                                    <img
                                      src={notification.propertyImage}
                                      alt=""
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                )}
                                <span className="text-xs font-medium text-gray-700 truncate">
                                  {notification.propertyTitle}
                                </span>
                              </div>
                            )}

                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center text-xs text-gray-500">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {formatTimestamp(notification.timestamp)}
                                </div>
                                <Badge className={`text-xs ${getPriorityBadgeColor(notification.priority)}`}>
                                  {notification.priority}
                                </Badge>
                              </div>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Notification Settings */}
        <div className="border-t p-4">
          <Button variant="outline" className="w-full" onClick={() => window.location.href = '/settings'}>
            <Bell className="h-4 w-4 mr-2" />
            Notification Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Notification Badge Component for Header
export function NotificationBadge({ onClick }: { onClick: () => void }) {
  const [unreadCount, setUnreadCount] = useState(3);
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <Button variant="ghost" size="sm" className="relative" onClick={onClick}>
      <Bell className="h-4 w-4" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Button>
  );
}

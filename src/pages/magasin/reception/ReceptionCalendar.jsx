import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ordersAPI } from '../../../lib/api';
import { 
  Calendar, ChevronLeft, ChevronRight, Truck, Package, Info
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const ReceptionCalendar = () => {
  // State for current month/year
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  
  // Fetch approved orders
  const { 
    data: orders = [], 
    isLoading: ordersLoading, 
    error: ordersError 
  } = useQuery({
    queryKey: ['orders', 'approved'],
    queryFn: () => ordersAPI.getByStatus(['approved'])
  });
  
  // Calendar navigation
  const prevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };
  
  const nextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };
  
  // Format date as YYYY-MM-DD for comparison
  const formatDateForComparison = (date) => {
    return date.toISOString().split('T')[0];
  };
  
  // Get orders for a specific date
  const getOrdersForDate = (date) => {
    const dateString = formatDateForComparison(date);
    return orders.filter(order => {
      const expectedDate = order.expectedDeliveryDate || order.date;
      return expectedDate === dateString;
    });
  };
  
  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
    let firstDayOfWeek = firstDay.getDay();
    // Adjust for Monday as first day of week
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    // Total days in the month
    const totalDays = lastDay.getDate();
    
    // Generate array of days
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ day: null, isCurrentMonth: false });
    }
    
    // Add days of the current month
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(year, month, day);
      const ordersForDay = getOrdersForDate(date);
      
      days.push({
        day,
        date,
        isCurrentMonth: true,
        isToday: formatDateForComparison(date) === formatDateForComparison(new Date()),
        isSelected: selectedDate && formatDateForComparison(date) === formatDateForComparison(selectedDate),
        orders: ordersForDay,
        hasOrders: ordersForDay.length > 0
      });
    }
    
    // Add empty cells for days after the last day of the month to complete the grid
    const totalCells = Math.ceil(days.length / 7) * 7;
    const remainingCells = totalCells - days.length;
    
    for (let i = 0; i < remainingCells; i++) {
      days.push({ day: null, isCurrentMonth: false });
    }
    
    return days;
  };
  
  // Format month and year
  const formatMonthYear = (date) => {
    return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  };
  
  // Get day cells
  const calendarDays = generateCalendarDays();
  
  // Get orders for selected date
  const selectedDateOrders = selectedDate ? getOrdersForDate(selectedDate) : [];
  
  // Loading state
  if (ordersLoading) {
    return <div className="p-6">Chargement du calendrier des réceptions...</div>;
  }
  
  // Error state
  if (ordersError) {
    return (
      <div className="p-6 text-red-500">
        Erreur lors du chargement des données: {ordersError.message}
      </div>
    );
  }
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Calendrier des Réceptions</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={goToToday}>
            Aujourd'hui
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle>
                <span className="capitalize">{formatMonthYear(currentDate)}</span>
              </CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="icon" onClick={prevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Days of the week */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, index) => (
                <div key={index} className="text-center font-medium text-sm py-2">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((dayObj, index) => (
                <div
                  key={index}
                  className={`
                    min-h-[80px] p-1 border rounded-md
                    ${!dayObj.isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''}
                    ${dayObj.isToday ? 'border-gray-500 bg-gray-50' : ''}
                    ${dayObj.isSelected ? 'border-primary-500 bg-primary-50' : ''}
                    ${dayObj.hasOrders ? 'cursor-pointer hover:bg-gray-100' : ''}
                  `}
                  onClick={() => dayObj.isCurrentMonth && dayObj.day && setSelectedDate(dayObj.date)}
                >
                  {dayObj.day && (
                    <>
                      <div className="flex justify-between items-start">
                        <span className={`
                          text-sm font-medium
                          ${dayObj.isToday ? 'text-blue-600' : ''}
                          ${dayObj.isSelected ? 'text-primary-600' : ''}
                        `}>
                          {dayObj.day}
                        </span>
                        {dayObj.hasOrders && (
                          <Badge className="bg-amber-100 text-amber-800 text-xs">
                            {dayObj.orders.length}
                          </Badge>
                        )}
                      </div>
                      <div className="mt-1 space-y-1">
                        {dayObj.orders.slice(0, 2).map(order => (
                          <div 
                            key={order.id} 
                            className="text-xs bg-amber-50 text-amber-800 rounded px-1 py-0.5 truncate"
                          >
                            {order.supplier}
                          </div>
                        ))}
                        {dayObj.orders.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{dayObj.orders.length - 2} plus
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Selected day details */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDate ? (
                <span>
                  Réceptions du {selectedDate.toLocaleDateString('fr-FR', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </span>
              ) : (
                <span>Détails des Réceptions</span>
              )}
            </CardTitle>
            <CardDescription>
              {selectedDate ? (
                selectedDateOrders.length > 0 ? 
                  `${selectedDateOrders.length} réception(s) prévue(s)` : 
                  'Aucune réception prévue'
              ) : (
                'Sélectionnez une date pour voir les détails'
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedDate ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
                <Calendar className="h-12 w-12 mb-2 text-gray-400" />
                <p>Cliquez sur une date dans le calendrier pour voir les réceptions prévues</p>
              </div>
            ) : selectedDateOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
                <Truck className="h-12 w-12 mb-2 text-gray-400" />
                <p>Aucune réception prévue pour cette date</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedDateOrders.map(order => (
                  <Card key={order.id} className="overflow-hidden">
                    <CardHeader className="p-3 pb-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">Commande #{order.id}</CardTitle>
                          <CardDescription className="text-xs">
                            {order.supplier}
                          </CardDescription>
                        </div>
                        <Badge className="bg-amber-100 text-amber-800">
                          {order.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3">
                      <div className="text-sm space-y-2">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Date de commande:</span>
                          <span>{order.date}</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Produits:</span>
                          <span>{order.items?.length || 0}</span>
                        </div>
                        <Button asChild size="sm" className="w-full mt-2">
                          <Link to={`/dashboard/magasin/reception/${order.id}`}>
                            <Truck className="h-4 w-4 mr-2" />
                            Réceptionner
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReceptionCalendar;

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from "sonner";

// Define the validation schema for the form using Zod
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  cropType: z.string().min(2, "Crop type is required."),
  locationSection: z.string().min(1, "Location section is required."),
  stage: z.enum(['Seedling', 'Growing', 'Mature', 'Harvesting']),
  waterNeeds: z.enum(['Low', 'Medium', 'Medium-High', 'High']),
  plantedDate: z.date({
    required_error: "Planted date is required.",
  }),
});

// We need to define the type for the props this component will receive
interface AddNewCropDialogProps {
  onCropAdded: (newCrop: any) => void;
}

export const AddNewCropDialog: React.FC<AddNewCropDialogProps> = ({ onCropAdded }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      cropType: "",
      stage: undefined, // Let the placeholder show
      waterNeeds: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    const payload = {
        ...values,
        location: {
            section: values.locationSection
        }
    };
    delete (payload as any).locationSection; 

    // --- ADD THIS LOG ---
    console.log("Sending this payload to the backend:", payload);
    const jsonPayload = JSON.stringify(payload);
    console.log("Payload as JSON string:", jsonPayload);
    // --------------------

    try {
      const response = await fetch('/api/crops', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body:jsonPayload, 
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to add crop.');
      }

      toast.success(`Crop "${result.data.name}" added successfully!`);
      onCropAdded(result.data); // Call the callback to update the parent's state
      setIsOpen(false); // Close the dialog
      form.reset(); // Reset the form for the next time

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-irrigation-green hover:bg-irrigation-green/90">
          Add New Crop
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add a New Crop</DialogTitle>
          <DialogDescription>
            Enter the details for your new crop. The system will calculate its initial watering schedule.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Crop Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Cherry Tomatoes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cropType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Crop Type</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Vegetable" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="locationSection"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Section</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., A1, B2" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Growth Stage</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select a stage" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Seedling">Seedling</SelectItem>
                      <SelectItem value="Growing">Growing</SelectItem>
                      <SelectItem value="Mature">Mature</SelectItem>
                      <SelectItem value="Harvesting">Harvesting</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="waterNeeds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Water Needs</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select water needs" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Medium-High">Medium-High</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="plantedDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Planted Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="ghost">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Crop
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
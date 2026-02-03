import { useState, useMemo } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { MISSED_REASONS } from '@/types/goals';

interface MissedReasonComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
}

export const MissedReasonCombobox = ({ value, onValueChange }: MissedReasonComboboxProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReasons = useMemo(() => {
    if (!searchQuery) return MISSED_REASONS;
    const query = searchQuery.toLowerCase();
    return MISSED_REASONS.filter((reason) => 
      reason.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value || "Select a reason..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Search reasons..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>No reason found.</CommandEmpty>
            <CommandGroup>
              {filteredReasons.map((reason) => (
                <CommandItem
                  key={reason}
                  value={reason}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? '' : currentValue);
                    setOpen(false);
                    setSearchQuery('');
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === reason ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {reason}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};